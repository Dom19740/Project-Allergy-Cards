import { createHash } from "node:crypto";
function serialize(o) {
  return typeof o == "string" ? `'${o}'` : new c().serialize(o);
}
const c = /* @__PURE__ */ (function() {
  class o {
    #t = /* @__PURE__ */ new Map();
    compare(t, r2) {
      const e2 = typeof t, n = typeof r2;
      return e2 === "string" && n === "string" ? t.localeCompare(r2) : e2 === "number" && n === "number" ? t - r2 : String.prototype.localeCompare.call(this.serialize(t, true), this.serialize(r2, true));
    }
    serialize(t, r2) {
      if (t === null) return "null";
      switch (typeof t) {
        case "string":
          return r2 ? t : `'${t}'`;
        case "bigint":
          return `${t}n`;
        case "object":
          return this.$object(t);
        case "function":
          return this.$function(t);
      }
      return String(t);
    }
    serializeObject(t) {
      const r2 = Object.prototype.toString.call(t);
      if (r2 !== "[object Object]") return this.serializeBuiltInType(r2.length < 10 ? `unknown:${r2}` : r2.slice(8, -1), t);
      const e2 = t.constructor, n = e2 === Object || e2 === void 0 ? "" : e2.name;
      if (n !== "" && globalThis[n] === e2) return this.serializeBuiltInType(n, t);
      if (typeof t.toJSON == "function") {
        const i = t.toJSON();
        return n + (i !== null && typeof i == "object" ? this.$object(i) : `(${this.serialize(i)})`);
      }
      return this.serializeObjectEntries(n, Object.entries(t));
    }
    serializeBuiltInType(t, r2) {
      const e2 = this["$" + t];
      if (e2) return e2.call(this, r2);
      if (typeof r2?.entries == "function") return this.serializeObjectEntries(t, r2.entries());
      throw new Error(`Cannot serialize ${t}`);
    }
    serializeObjectEntries(t, r2) {
      const e2 = Array.from(r2).sort((i, a) => this.compare(i[0], a[0]));
      let n = `${t}{`;
      for (let i = 0; i < e2.length; i++) {
        const [a, l] = e2[i];
        n += `${this.serialize(a, true)}:${this.serialize(l)}`, i < e2.length - 1 && (n += ",");
      }
      return n + "}";
    }
    $object(t) {
      let r2 = this.#t.get(t);
      return r2 === void 0 && (this.#t.set(t, `#${this.#t.size}`), r2 = this.serializeObject(t), this.#t.set(t, r2)), r2;
    }
    $function(t) {
      const r2 = Function.prototype.toString.call(t);
      return r2.slice(-15) === "[native code] }" ? `${t.name || ""}()[native]` : `${t.name}(${t.length})${r2.replace(/\s*\n\s*/g, "")}`;
    }
    $Array(t) {
      let r2 = "[";
      for (let e2 = 0; e2 < t.length; e2++) r2 += this.serialize(t[e2]), e2 < t.length - 1 && (r2 += ",");
      return r2 + "]";
    }
    $Date(t) {
      try {
        return `Date(${t.toISOString()})`;
      } catch {
        return "Date(null)";
      }
    }
    $ArrayBuffer(t) {
      return `ArrayBuffer[${new Uint8Array(t).join(",")}]`;
    }
    $Set(t) {
      return `Set${this.$Array(Array.from(t).sort((r2, e2) => this.compare(r2, e2)))}`;
    }
    $Map(t) {
      return this.serializeObjectEntries("Map", t.entries());
    }
  }
  for (const s2 of ["Error", "RegExp", "URL"]) o.prototype["$" + s2] = function(t) {
    return `${s2}(${t})`;
  };
  for (const s2 of ["Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"]) o.prototype["$" + s2] = function(t) {
    return `${s2}[${t.join(",")}]`;
  };
  for (const s2 of ["BigInt64Array", "BigUint64Array"]) o.prototype["$" + s2] = function(t) {
    return `${s2}[${t.join("n,")}${t.length > 0 ? "n" : ""}]`;
  };
  return o;
})();
const e = globalThis.process?.getBuiltinModule?.("crypto")?.hash, r = "sha256", s = "base64url";
function digest(t) {
  if (e) return e(r, t, s);
  const o = createHash(r).update(t);
  return globalThis.process?.versions?.webcontainer ? o.digest().toString(s) : o.digest(s);
}
function hash(input) {
  return digest(serialize(input));
}
export {
  hash as h
};
