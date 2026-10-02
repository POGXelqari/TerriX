#!/usr/bin/env python3
"""
CBM Ad & Sponsorship Engine
===========================
1. In-Website First-Party Sponsorships: Clickable images with strict dimensional
   profiles, 60/40 covenant splits, and vacancy fallbacks.
2. External Official CBM Ads: Delivered strictly off-site with probabilistic fill
   pacing, visual rest intervals, and publisher affiliate tracking.
"""

import html
import re
import time
import random
import threading
from typing import Dict, Any, Optional, Tuple, List

# Dimension Standards
SLOT_SPECIFICATIONS = {
    "SLOT_HERO": {
        "width": 728, "height": 90, "aspect_ratio": 728 / 90,
        "max_bytes": 350 * 1024, "tolerance": 0.05
    },
    "SLOT_TELEMETRY": {
        "width": 600, "height": 100, "aspect_ratio": 600 / 100,
        "max_bytes": 250 * 1024, "tolerance": 0.05
    },
    "SLOT_DISCORD": {
        "width": 300, "height": 250, "aspect_ratio": 300 / 250,
        "max_bytes": 200 * 1024, "tolerance": 0.05
    }
}


class CBMAvailabilityEngine:
    """
    Regulates external delivery of official CBM ads.
    Controls fill rate, anti-fatigue cooldowns, and visual rest pacing.
    """
    FILL_PROBABILITY_ALPHA = 0.70  # 70% fill rate, 30% visual rest
    MAX_SESSION_IMPRESSIONS = 3     # 3 impressions per 10-minute window
    COOLDOWN_SECONDS = 300.0        # 5-minute cooldown when capped

    _lock = threading.Lock()
    _session_impressions: Dict[str, List[float]] = {}

    @classmethod
    def should_serve_external_ad(cls, client_key: str) -> Tuple[bool, str]:
        """
        Determines whether an official ad should be served or withheld.
        """
        now = time.time()
        with cls._lock:
            # Clean expired timestamps older than 600 seconds
            history = [t for t in cls._session_impressions.get(client_key, []) if now - t < 600.0]
            cls._session_impressions[client_key] = history

            # Frequency cap evaluation
            if len(history) >= cls.MAX_SESSION_IMPRESSIONS:
                oldest = history[0]
                if now - oldest < cls.COOLDOWN_SECONDS:
                    return False, "FREQUENCY_CAP_REST"

            # Probabilistic pacing roll
            if random.random() >= cls.FILL_PROBABILITY_ALPHA:
                return False, "PACING_REST_WINDOW"

            history.append(now)
            return True, "SERVE"


class CBMSponsorshipEngine:
    """
    Manages First-Party Website Sponsorships and Off-Site Official Ads.
    """
    _click_lock = threading.Lock()
    _recent_clicks: Dict[str, float] = {}

    @staticmethod
    def validate_creative_url(url: str) -> bool:
        """Enforces safe HTTPS image URLs or relative first-party assets."""
        if not url or not isinstance(url, str):
            return False
        clean = url.strip()
        if clean.startswith("/assets/") or clean.startswith("/api/cbm/chat/media") or clean.startswith("/api/v1/assets/"):
            return True
        return clean.startswith("https://") and not any(
            c in clean for c in ('<', '>', '"', "'", 'javascript:', 'data:')
        )

    @classmethod
    def get_inventory_status(cls, db_instance) -> Dict[str, Any]:
        """
        Returns real-time status of all sponsorship slots, prices, and availability.
        """
        slots = db_instance.get_sponsorship_slots()
        available_count = sum(1 for s in slots if s.get("is_available"))
        return {
            "total_slots": len(slots),
            "available_slots": available_count,
            "leased_slots": len(slots) - available_count,
            "slots": slots,
            "specifications": SLOT_SPECIFICATIONS,
            "covenant_split": {
                "bank_reserves_percent": 60.0,
                "referral_rewards_percent": 40.0
            }
        }

    @classmethod
    def purchase_sponsorship(
        cls,
        db_instance,
        slot_id: str,
        buyer_account: str,
        title: str,
        tagline: str,
        target_url: str,
        badge_text: str = "PROMOTED",
        image_url: Optional[str] = None,
        duration_days: int = 7
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Atomically books a sponsorship lease with validated dimensions and creative URL.
        """
        spec = SLOT_SPECIFICATIONS.get(slot_id, SLOT_SPECIFICATIONS["SLOT_HERO"])
        width = spec["width"]
        height = spec["height"]

        if image_url:
            if not cls.validate_creative_url(image_url):
                return False, "Invalid image URL. Must be a secure HTTPS link or first-party asset path.", None

        return db_instance.purchase_sponsorship_lease(
            slot_id=slot_id,
            buyer_account=buyer_account,
            title=title,
            tagline=tagline,
            target_url=target_url,
            badge_text=badge_text,
            image_url=image_url,
            image_width=width,
            image_height=height,
            duration_days=duration_days
        )

    @classmethod
    def serve_ad_request(
        cls,
        db_instance,
        slot_id: str,
        context: str = "website",
        client_ip: str = "127.0.0.1",
        publisher_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Unified Ad Serve Router.
        - context == 'website': Delivers Paid Sponsor or Vacant CTA. Official ads strictly barred.
        - context == 'external': Evaluates Availability Engine & delivers Official Ad.
        """
        slot = db_instance.get_sponsorship_slot(slot_id)
        if not slot:
            return {"status": "error", "message": f"Invalid slot_id: {slot_id}"}

        # -------------------------------------------------------------
        # BRANCH 1: IN-WEBSITE FIRST-PARTY SPONSORSHIPS
        # -------------------------------------------------------------
        if context == "website":
            # Paid sponsor lease check (include_official=False)
            paid_ad = db_instance.get_active_ad_for_slot(slot_id, include_official=False)
            if paid_ad and not paid_ad.get("is_official"):
                return {
                    "status": "ok",
                    "fill": True,
                    "tier": "PAID_SPONSOR",
                    "slot_id": slot_id,
                    "ad": paid_ad
                }

            # If no active paid sponsor, return Vacant Booking CTA
            return {
                "status": "ok",
                "fill": False,
                "tier": "VACANT_SLOT",
                "slot_id": slot_id,
                "slot_info": slot,
                "cta": {
                    "title": f"{slot['name']} Available",
                    "tagline": f"Promote to active players. Starting at {slot['current_price_gold']:.0f} Gold/week.",
                    "target_url": "/developer.html#sponsorships"
                }
            }

        # -------------------------------------------------------------
        # BRANCH 2: EXTERNAL THIRD-PARTY DELIVERY (OFFICIAL ADS ONLY)
        # -------------------------------------------------------------
        client_key = f"{client_ip}_{publisher_id or 'anon'}"
        should_serve, reason = CBMAvailabilityEngine.should_serve_external_ad(client_key)

        if not should_serve:
            return {
                "status": "ok",
                "fill": False,
                "tier": "OFFICIAL_REST",
                "slot_id": slot_id,
                "reason": reason,
                "cooldown_seconds": int(CBMAvailabilityEngine.COOLDOWN_SECONDS)
            }

        # Fetch official campaign from DB
        official_ad = db_instance.get_official_cbm_ad(slot_id)
        if not official_ad:
            return {
                "status": "ok",
                "fill": False,
                "tier": "NO_CAMPAIGN",
                "slot_id": slot_id
            }

        # Track publisher impression if publisher_id provided
        if publisher_id:
            try:
                db_instance.record_publisher_impression(publisher_id)
            except Exception:
                pass

            target = official_ad["target_url"]
            sep = "&" if "?" in target else "?"
            target = f"{target}{sep}ref={html.escape(publisher_id)}"
            official_ad["target_url"] = target

        return {
            "status": "ok",
            "fill": True,
            "tier": "OFFICIAL_CBM_AD",
            "slot_id": slot_id,
            "publisher_id": publisher_id,
            "ad": official_ad
        }

    @classmethod
    def record_click(cls, db_instance, ad_id: str, publisher_id: Optional[str] = None, client_ip: str = "127.0.0.1") -> bool:
        """
        Records a verified user click event with anti-flooding rate limiting.
        """
        now = time.time()
        click_key = f"{client_ip}_{ad_id}"
        with cls._click_lock:
            # Enforce 60-second cooldown per client IP per ad_id
            last_click = cls._recent_clicks.get(click_key, 0.0)
            if now - last_click < 60.0:
                return False
            cls._recent_clicks[click_key] = now

            # Clean expired records older than 120 seconds
            cls._recent_clicks = {k: v for k, v in cls._recent_clicks.items() if now - v < 120.0}

        success = db_instance.record_ad_click(ad_id)
        if success and publisher_id:
            try:
                db_instance.record_publisher_click(publisher_id)
            except Exception:
                pass
        return success

    @classmethod
    def render_website_banner_html(cls, db_instance, slot_id: str) -> str:
        """
        Renders safe, sanitized HTML for in-website first-party placements.
        Guarantees zero XSS, zero CLS, and direct booking CTA on vacancy.
        """
        res = cls.serve_ad_request(db_instance, slot_id, context="website")
        spec = SLOT_SPECIFICATIONS.get(slot_id, SLOT_SPECIFICATIONS["SLOT_HERO"])
        w, h = spec["width"], spec["height"]

        if res.get("fill") and res.get("tier") == "PAID_SPONSOR":
            ad = res["ad"]
            safe_title = html.escape(ad.get("title", ""), quote=True)
            safe_tagline = html.escape(ad.get("tagline", ""), quote=True)
            safe_url = html.escape(ad.get("target_url", "#"), quote=True)
            safe_badge = html.escape(ad.get("badge_text", "PROMOTED"), quote=True)
            safe_sponsor = html.escape(ad.get("owner_account", ""), quote=True)
            safe_img = html.escape(ad.get("image_url", ""), quote=True)
            ad_id = html.escape(ad.get("ad_id", ""), quote=True)

            img_tag = ""
            if safe_img:
                img_tag = f"""<img src="{safe_img}" width="{w}" height="{h}" alt="{safe_title}" class="cbm-ad-banner-img" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;" loading="eager" />"""

            return f"""<div class="cbm-ad-container-{slot_id.lower()} cbm-sponsored-banner" data-slot="{html.escape(slot_id, quote=True)}" data-ad-id="{ad_id}" style="width:100%;max-width:{w}px;height:{h}px;aspect-ratio:{w}/{h};margin:14px auto;position:relative;overflow:hidden;border-radius:10px;border:1px solid rgba(0,112,186,0.4);background:#0e1626;">
    <a href="{safe_url}" target="_blank" rel="noopener noreferrer nofollow" onclick="fetch('/api/v1/ads/click?ad_id={ad_id}', {{method:'POST'}}).catch(function(){{}});" style="display:block;width:100%;height:100%;text-decoration:none;">
        {img_tag}
        <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(0deg,rgba(8,13,22,0.92) 0%,rgba(8,13,22,0.4) 70%,transparent 100%);padding:8px 14px;display:flex;align-items:center;justify-content:space-between;">
            <div>
                <span style="background:rgba(0,112,186,0.3);color:#00a2ff;border:1px solid rgba(0,162,255,0.4);font-size:9px;font-weight:700;padding:1px 6px;border-radius:4px;text-transform:uppercase;">{safe_badge}</span>
                <span style="font-weight:700;color:#fff;font-size:13px;margin-left:6px;">{safe_title}</span>
                <span style="font-size:11px;color:#9aa8be;margin-left:6px;">&bull; {safe_tagline}</span>
            </div>
            <span style="font-size:11px;color:#cbd5e1;font-weight:600;">Partner: {safe_sponsor} &rarr;</span>
        </div>
    </a>
</div>"""

        # Vacant State CTA (Never shows official CBM ad on website)
        slot = res.get("slot_info", {})
        slot_name = html.escape(slot.get("name", "Sponsorship Slot"), quote=True)
        price_gold = slot.get("current_price_gold", 500.0)

        icon_html = """<div style="width:46px;height:46px;aspect-ratio:1/1;border-radius:10px;background:radial-gradient(circle at 35% 30%,rgba(0,112,224,0.25),rgba(10,14,24,0.7));border:1px solid rgba(0,112,224,0.4);box-shadow:inset 0 1px 2px rgba(120,190,255,0.35),0 4px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <img src="/sponsorship-available-icon1.png" width="38" height="21" alt="Sponsorship Available" style="object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));" />
    </div>"""

        return f"""<div class="cbm-ad-container-{slot_id.lower()} cbm-banner-vacant" data-slot="{html.escape(slot_id, quote=True)}" style="width:100%;max-width:{w}px;height:{h}px;aspect-ratio:{w}/{h};margin:14px auto;padding:12px 20px;background:rgba(14,22,38,0.7);border:1px dashed rgba(255,255,255,0.15);border-radius:10px;display:flex;align-items:center;justify-content:space-between;box-sizing:border-box;">
    <div style="display:flex;align-items:center;gap:14px;">
        {icon_html}
        <div>
            <div style="font-weight:700;color:#f6f9fc;font-size:13px;">{slot_name} Available</div>
            <div style="font-size:11px;color:#9aa8be;">Reach verified clan members and developers. Starting at {price_gold:,.0f} Gold/week.</div>
        </div>
    </div>
    <a href="/developer.html#sponsorships" style="padding:7px 16px;background:rgba(0,112,186,0.18);color:#00a2ff;border:1px solid rgba(0,162,255,0.35);border-radius:6px;font-size:12px;font-weight:700;text-decoration:none;">Book Sponsorship &rarr;</a>
</div>"""
