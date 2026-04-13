/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ts = require("typescript");

function loadAccessControlModule() {
  const sourcePath = path.resolve(__dirname, "../lib/access-control.ts");
  const source = fs.readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });

  const moduleObj = { exports: {} };
  const fn = new Function("exports", "require", "module", "__filename", "__dirname", transpiled.outputText);
  fn(moduleObj.exports, require, moduleObj, sourcePath, path.dirname(sourcePath));
  return moduleObj.exports;
}

function run(name, fn) {
  fn();
  console.log(`PASS ${name}`);
}

const {
  getRequiredRole,
  isAuthProtectedPath,
  normalizeRoles,
  roleAllowsPath,
} = loadAccessControlModule();

run("isAuthProtectedPath matches protected routes and nested paths", () => {
  assert.equal(isAuthProtectedPath("/devocionales"), true);
  assert.equal(isAuthProtectedPath("/devocionales/hoy"), true);
  assert.equal(isAuthProtectedPath("/eventos"), false);
});

run("getRequiredRole resolves role routes and ignores non-role routes", () => {
  assert.equal(getRequiredRole("/admin"), "admin");
  assert.equal(getRequiredRole("/admin/usuarios"), "admin");
  assert.equal(getRequiredRole("/lider"), "lider");
  assert.equal(getRequiredRole("/cocina/eventos"), "cocina");
  assert.equal(getRequiredRole("/perfil"), null);
});

run("roleAllowsPath grants admin bypass and role-specific access", () => {
  assert.equal(roleAllowsPath("lider", ["lider"]), true);
  assert.equal(roleAllowsPath("lider", ["admin"]), true);
  assert.equal(roleAllowsPath("admin", ["lider", "miembro"]), false);
  assert.equal(roleAllowsPath(null, []), true);
});

run("normalizeRoles prefers roles array and falls back to rol", () => {
  assert.deepEqual(normalizeRoles({ roles: ["lider"], rol: "miembro" }), ["lider"]);
  assert.deepEqual(normalizeRoles({ roles: [], rol: "cocina" }), ["cocina"]);
  assert.deepEqual(normalizeRoles({ rol: "admin" }), ["admin"]);
  assert.deepEqual(normalizeRoles({}), []);
  assert.deepEqual(normalizeRoles(null), []);
});
