// scripts/astPatcher.js
import * as parser from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';

const traverse = traverseModule.default || traverseModule;
const generate = generateModule.default || generateModule;

/**
 * Structurally patches game code using Babel AST analysis to inject
 * TerriX client render hooks without relying on fragile string replacements.
 *
 * @param {string} sourceCode
 * @returns {string} Patched JavaScript source code
 */
export function patchGameAst(sourceCode) {
    const ast = parser.parse(sourceCode, { sourceType: "script" });
    let hookInjected = false;

    traverse(ast, {
        CallExpression(path) {
            // Locate ws.drawImage(a0O, aT.a0L(), aT.a0M()) regardless of exact variable names
            const { callee, arguments: args } = path.node;
            if (
                t.isMemberExpression(callee) &&
                t.isIdentifier(callee.property, { name: "drawImage" }) &&
                args.length === 3 &&
                t.isCallExpression(args[1]) &&
                t.isCallExpression(args[2])
            ) {
                // Confirm offset calls are on viewport offset object (not Math)
                const isOffsetObj = (arg) => t.isMemberExpression(arg.callee) && t.isIdentifier(arg.callee.object) && arg.callee.object.name !== "Math";
                if (!isOffsetObj(args[1]) || !isOffsetObj(args[2])) {
                    return;
                }

                // Confirm target is a canvas identifier (e.g. a0O), not static canvas word or map background
                if (!t.isIdentifier(args[0]) || args[0].name === "canvas") {
                    return;
                }

                const wsIdent = callee.object;
                const a0OIdent = args[0];
                const oxCall = args[1];
                const oyCall = args[2];

                // Construct: (window.__TERRIX_HOOK_RENDER__ && window.__TERRIX_HOOK_RENDER__(ws, a0O, im, ox, oy))
                const hookExpr = t.logicalExpression(
                    "&&",
                    t.memberExpression(t.identifier("window"), t.identifier("__TERRIX_HOOK_RENDER__")),
                    t.callExpression(
                        t.memberExpression(t.identifier("window"), t.identifier("__TERRIX_HOOK_RENDER__")),
                        [wsIdent, a0OIdent, t.identifier("im"), oxCall, oyCall]
                    )
                );

                path.replaceWith(t.sequenceExpression([path.node, hookExpr]));
                hookInjected = true;
                path.skip();
            }
        }
    });

    if (!hookInjected) {
        throw new Error("[CRITICAL] Failed to structurally locate render loop for __TERRIX_HOOK_RENDER__.");
    }

    return generate(ast, { compact: false }, sourceCode).code;
}
