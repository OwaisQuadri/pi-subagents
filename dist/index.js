import { createRequire } from "node:module";
var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/@sinclair/typebox/build/esm/type/guard/value.mjs
var exports_value = {};
__export(exports_value, {
  IsUndefined: () => IsUndefined,
  IsUint8Array: () => IsUint8Array,
  IsSymbol: () => IsSymbol,
  IsString: () => IsString,
  IsRegExp: () => IsRegExp,
  IsObject: () => IsObject,
  IsNumber: () => IsNumber,
  IsNull: () => IsNull,
  IsIterator: () => IsIterator,
  IsFunction: () => IsFunction,
  IsDate: () => IsDate,
  IsBoolean: () => IsBoolean,
  IsBigInt: () => IsBigInt,
  IsAsyncIterator: () => IsAsyncIterator,
  IsArray: () => IsArray,
  HasPropertyKey: () => HasPropertyKey
});
function HasPropertyKey(value, key) {
  return key in value;
}
function IsAsyncIterator(value) {
  return IsObject(value) && !IsArray(value) && !IsUint8Array(value) && Symbol.asyncIterator in value;
}
function IsArray(value) {
  return Array.isArray(value);
}
function IsBigInt(value) {
  return typeof value === "bigint";
}
function IsBoolean(value) {
  return typeof value === "boolean";
}
function IsDate(value) {
  return value instanceof globalThis.Date;
}
function IsFunction(value) {
  return typeof value === "function";
}
function IsIterator(value) {
  return IsObject(value) && !IsArray(value) && !IsUint8Array(value) && Symbol.iterator in value;
}
function IsNull(value) {
  return value === null;
}
function IsNumber(value) {
  return typeof value === "number";
}
function IsObject(value) {
  return typeof value === "object" && value !== null;
}
function IsRegExp(value) {
  return value instanceof globalThis.RegExp;
}
function IsString(value) {
  return typeof value === "string";
}
function IsSymbol(value) {
  return typeof value === "symbol";
}
function IsUint8Array(value) {
  return value instanceof globalThis.Uint8Array;
}
function IsUndefined(value) {
  return value === undefined;
}

// node_modules/@sinclair/typebox/build/esm/type/clone/value.mjs
function ArrayType(value) {
  return value.map((value2) => Visit(value2));
}
function DateType(value) {
  return new Date(value.getTime());
}
function Uint8ArrayType(value) {
  return new Uint8Array(value);
}
function RegExpType(value) {
  return new RegExp(value.source, value.flags);
}
function ObjectType(value) {
  const result = {};
  for (const key of Object.getOwnPropertyNames(value)) {
    result[key] = Visit(value[key]);
  }
  for (const key of Object.getOwnPropertySymbols(value)) {
    result[key] = Visit(value[key]);
  }
  return result;
}
function Visit(value) {
  return IsArray(value) ? ArrayType(value) : IsDate(value) ? DateType(value) : IsUint8Array(value) ? Uint8ArrayType(value) : IsRegExp(value) ? RegExpType(value) : IsObject(value) ? ObjectType(value) : value;
}
function Clone(value) {
  return Visit(value);
}
var init_value = () => {};

// node_modules/@sinclair/typebox/build/esm/type/clone/type.mjs
function CloneType(schema, options) {
  return options === undefined ? Clone(schema) : Clone({ ...options, ...schema });
}
var init_type = __esm(() => {
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/clone/index.mjs
var init_clone = __esm(() => {
  init_type();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/value/guard/guard.mjs
function IsObject2(value2) {
  return value2 !== null && typeof value2 === "object";
}
function IsArray2(value2) {
  return globalThis.Array.isArray(value2) && !globalThis.ArrayBuffer.isView(value2);
}
function IsUndefined2(value2) {
  return value2 === undefined;
}
function IsNumber2(value2) {
  return typeof value2 === "number";
}

// node_modules/@sinclair/typebox/build/esm/value/guard/index.mjs
var init_guard = () => {};

// node_modules/@sinclair/typebox/build/esm/system/policy.mjs
var TypeSystemPolicy;
var init_policy = __esm(() => {
  init_guard();
  (function(TypeSystemPolicy2) {
    TypeSystemPolicy2.InstanceMode = "default";
    TypeSystemPolicy2.ExactOptionalPropertyTypes = false;
    TypeSystemPolicy2.AllowArrayObject = false;
    TypeSystemPolicy2.AllowNaN = false;
    TypeSystemPolicy2.AllowNullVoid = false;
    function IsExactOptionalProperty(value2, key) {
      return TypeSystemPolicy2.ExactOptionalPropertyTypes ? key in value2 : value2[key] !== undefined;
    }
    TypeSystemPolicy2.IsExactOptionalProperty = IsExactOptionalProperty;
    function IsObjectLike(value2) {
      const isObject = IsObject2(value2);
      return TypeSystemPolicy2.AllowArrayObject ? isObject : isObject && !IsArray2(value2);
    }
    TypeSystemPolicy2.IsObjectLike = IsObjectLike;
    function IsRecordLike(value2) {
      return IsObjectLike(value2) && !(value2 instanceof Date) && !(value2 instanceof Uint8Array);
    }
    TypeSystemPolicy2.IsRecordLike = IsRecordLike;
    function IsNumberLike(value2) {
      return TypeSystemPolicy2.AllowNaN ? IsNumber2(value2) : Number.isFinite(value2);
    }
    TypeSystemPolicy2.IsNumberLike = IsNumberLike;
    function IsVoidLike(value2) {
      const isUndefined = IsUndefined2(value2);
      return TypeSystemPolicy2.AllowNullVoid ? isUndefined || value2 === null : isUndefined;
    }
    TypeSystemPolicy2.IsVoidLike = IsVoidLike;
  })(TypeSystemPolicy || (TypeSystemPolicy = {}));
});

// node_modules/@sinclair/typebox/build/esm/type/create/immutable.mjs
function ImmutableArray(value2) {
  return globalThis.Object.freeze(value2).map((value3) => Immutable(value3));
}
function ImmutableDate(value2) {
  return value2;
}
function ImmutableUint8Array(value2) {
  return value2;
}
function ImmutableRegExp(value2) {
  return value2;
}
function ImmutableObject(value2) {
  const result = {};
  for (const key of Object.getOwnPropertyNames(value2)) {
    result[key] = Immutable(value2[key]);
  }
  for (const key of Object.getOwnPropertySymbols(value2)) {
    result[key] = Immutable(value2[key]);
  }
  return globalThis.Object.freeze(result);
}
function Immutable(value2) {
  return IsArray(value2) ? ImmutableArray(value2) : IsDate(value2) ? ImmutableDate(value2) : IsUint8Array(value2) ? ImmutableUint8Array(value2) : IsRegExp(value2) ? ImmutableRegExp(value2) : IsObject(value2) ? ImmutableObject(value2) : value2;
}
var init_immutable = () => {};

// node_modules/@sinclair/typebox/build/esm/type/create/type.mjs
function CreateType(schema, options) {
  const result = options !== undefined ? { ...options, ...schema } : schema;
  switch (TypeSystemPolicy.InstanceMode) {
    case "freeze":
      return Immutable(result);
    case "clone":
      return Clone(result);
    default:
      return result;
  }
}
var init_type2 = __esm(() => {
  init_policy();
  init_immutable();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/create/index.mjs
var init_create = __esm(() => {
  init_type2();
});

// node_modules/@sinclair/typebox/build/esm/type/error/error.mjs
var TypeBoxError;
var init_error = __esm(() => {
  TypeBoxError = class TypeBoxError extends Error {
    constructor(message) {
      super(message);
    }
  };
});

// node_modules/@sinclair/typebox/build/esm/type/error/index.mjs
var init_error2 = __esm(() => {
  init_error();
});

// node_modules/@sinclair/typebox/build/esm/type/symbols/symbols.mjs
var TransformKind, ReadonlyKind, OptionalKind, Hint, Kind;
var init_symbols = __esm(() => {
  TransformKind = Symbol.for("TypeBox.Transform");
  ReadonlyKind = Symbol.for("TypeBox.Readonly");
  OptionalKind = Symbol.for("TypeBox.Optional");
  Hint = Symbol.for("TypeBox.Hint");
  Kind = Symbol.for("TypeBox.Kind");
});

// node_modules/@sinclair/typebox/build/esm/type/symbols/index.mjs
var init_symbols2 = __esm(() => {
  init_symbols();
});

// node_modules/@sinclair/typebox/build/esm/type/guard/kind.mjs
function IsReadonly(value2) {
  return IsObject(value2) && value2[ReadonlyKind] === "Readonly";
}
function IsOptional(value2) {
  return IsObject(value2) && value2[OptionalKind] === "Optional";
}
function IsAny(value2) {
  return IsKindOf(value2, "Any");
}
function IsArgument(value2) {
  return IsKindOf(value2, "Argument");
}
function IsArray3(value2) {
  return IsKindOf(value2, "Array");
}
function IsAsyncIterator2(value2) {
  return IsKindOf(value2, "AsyncIterator");
}
function IsBigInt2(value2) {
  return IsKindOf(value2, "BigInt");
}
function IsBoolean2(value2) {
  return IsKindOf(value2, "Boolean");
}
function IsComputed(value2) {
  return IsKindOf(value2, "Computed");
}
function IsConstructor(value2) {
  return IsKindOf(value2, "Constructor");
}
function IsDate2(value2) {
  return IsKindOf(value2, "Date");
}
function IsFunction2(value2) {
  return IsKindOf(value2, "Function");
}
function IsInteger(value2) {
  return IsKindOf(value2, "Integer");
}
function IsIntersect(value2) {
  return IsKindOf(value2, "Intersect");
}
function IsIterator2(value2) {
  return IsKindOf(value2, "Iterator");
}
function IsKindOf(value2, kind) {
  return IsObject(value2) && Kind in value2 && value2[Kind] === kind;
}
function IsLiteralValue(value2) {
  return IsBoolean(value2) || IsNumber(value2) || IsString(value2);
}
function IsLiteral(value2) {
  return IsKindOf(value2, "Literal");
}
function IsMappedKey(value2) {
  return IsKindOf(value2, "MappedKey");
}
function IsMappedResult(value2) {
  return IsKindOf(value2, "MappedResult");
}
function IsNever(value2) {
  return IsKindOf(value2, "Never");
}
function IsNot(value2) {
  return IsKindOf(value2, "Not");
}
function IsNull2(value2) {
  return IsKindOf(value2, "Null");
}
function IsNumber3(value2) {
  return IsKindOf(value2, "Number");
}
function IsObject3(value2) {
  return IsKindOf(value2, "Object");
}
function IsPromise(value2) {
  return IsKindOf(value2, "Promise");
}
function IsRecord(value2) {
  return IsKindOf(value2, "Record");
}
function IsRef(value2) {
  return IsKindOf(value2, "Ref");
}
function IsRegExp2(value2) {
  return IsKindOf(value2, "RegExp");
}
function IsString2(value2) {
  return IsKindOf(value2, "String");
}
function IsSymbol2(value2) {
  return IsKindOf(value2, "Symbol");
}
function IsTemplateLiteral(value2) {
  return IsKindOf(value2, "TemplateLiteral");
}
function IsThis(value2) {
  return IsKindOf(value2, "This");
}
function IsTransform(value2) {
  return IsObject(value2) && TransformKind in value2;
}
function IsTuple(value2) {
  return IsKindOf(value2, "Tuple");
}
function IsUndefined3(value2) {
  return IsKindOf(value2, "Undefined");
}
function IsUnion(value2) {
  return IsKindOf(value2, "Union");
}
function IsUint8Array2(value2) {
  return IsKindOf(value2, "Uint8Array");
}
function IsUnknown(value2) {
  return IsKindOf(value2, "Unknown");
}
function IsUnsafe(value2) {
  return IsKindOf(value2, "Unsafe");
}
function IsVoid(value2) {
  return IsKindOf(value2, "Void");
}
function IsKind(value2) {
  return IsObject(value2) && Kind in value2 && IsString(value2[Kind]);
}
function IsSchema(value2) {
  return IsAny(value2) || IsArgument(value2) || IsArray3(value2) || IsBoolean2(value2) || IsBigInt2(value2) || IsAsyncIterator2(value2) || IsComputed(value2) || IsConstructor(value2) || IsDate2(value2) || IsFunction2(value2) || IsInteger(value2) || IsIntersect(value2) || IsIterator2(value2) || IsLiteral(value2) || IsMappedKey(value2) || IsMappedResult(value2) || IsNever(value2) || IsNot(value2) || IsNull2(value2) || IsNumber3(value2) || IsObject3(value2) || IsPromise(value2) || IsRecord(value2) || IsRef(value2) || IsRegExp2(value2) || IsString2(value2) || IsSymbol2(value2) || IsTemplateLiteral(value2) || IsThis(value2) || IsTuple(value2) || IsUndefined3(value2) || IsUnion(value2) || IsUint8Array2(value2) || IsUnknown(value2) || IsUnsafe(value2) || IsVoid(value2) || IsKind(value2);
}
var init_kind = __esm(() => {
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/guard/type.mjs
var exports_type = {};
__export(exports_type, {
  TypeGuardUnknownTypeError: () => TypeGuardUnknownTypeError,
  IsVoid: () => IsVoid2,
  IsUnsafe: () => IsUnsafe2,
  IsUnknown: () => IsUnknown2,
  IsUnionLiteral: () => IsUnionLiteral,
  IsUnion: () => IsUnion2,
  IsUndefined: () => IsUndefined4,
  IsUint8Array: () => IsUint8Array3,
  IsTuple: () => IsTuple2,
  IsTransform: () => IsTransform2,
  IsThis: () => IsThis2,
  IsTemplateLiteral: () => IsTemplateLiteral2,
  IsSymbol: () => IsSymbol3,
  IsString: () => IsString3,
  IsSchema: () => IsSchema2,
  IsRegExp: () => IsRegExp3,
  IsRef: () => IsRef2,
  IsRecursive: () => IsRecursive,
  IsRecord: () => IsRecord2,
  IsReadonly: () => IsReadonly2,
  IsProperties: () => IsProperties,
  IsPromise: () => IsPromise2,
  IsOptional: () => IsOptional2,
  IsObject: () => IsObject4,
  IsNumber: () => IsNumber4,
  IsNull: () => IsNull3,
  IsNot: () => IsNot2,
  IsNever: () => IsNever2,
  IsMappedResult: () => IsMappedResult2,
  IsMappedKey: () => IsMappedKey2,
  IsLiteralValue: () => IsLiteralValue2,
  IsLiteralString: () => IsLiteralString,
  IsLiteralNumber: () => IsLiteralNumber,
  IsLiteralBoolean: () => IsLiteralBoolean,
  IsLiteral: () => IsLiteral2,
  IsKindOf: () => IsKindOf2,
  IsKind: () => IsKind2,
  IsIterator: () => IsIterator3,
  IsIntersect: () => IsIntersect2,
  IsInteger: () => IsInteger2,
  IsImport: () => IsImport,
  IsFunction: () => IsFunction3,
  IsDate: () => IsDate3,
  IsConstructor: () => IsConstructor2,
  IsComputed: () => IsComputed2,
  IsBoolean: () => IsBoolean3,
  IsBigInt: () => IsBigInt3,
  IsAsyncIterator: () => IsAsyncIterator3,
  IsArray: () => IsArray4,
  IsArgument: () => IsArgument2,
  IsAny: () => IsAny2
});
function IsPattern(value2) {
  try {
    new RegExp(value2);
    return true;
  } catch {
    return false;
  }
}
function IsControlCharacterFree(value2) {
  if (!IsString(value2))
    return false;
  for (let i = 0;i < value2.length; i++) {
    const code = value2.charCodeAt(i);
    if (code >= 7 && code <= 13 || code === 27 || code === 127) {
      return false;
    }
  }
  return true;
}
function IsAdditionalProperties(value2) {
  return IsOptionalBoolean(value2) || IsSchema2(value2);
}
function IsOptionalBigInt(value2) {
  return IsUndefined(value2) || IsBigInt(value2);
}
function IsOptionalNumber(value2) {
  return IsUndefined(value2) || IsNumber(value2);
}
function IsOptionalBoolean(value2) {
  return IsUndefined(value2) || IsBoolean(value2);
}
function IsOptionalString(value2) {
  return IsUndefined(value2) || IsString(value2);
}
function IsOptionalPattern(value2) {
  return IsUndefined(value2) || IsString(value2) && IsControlCharacterFree(value2) && IsPattern(value2);
}
function IsOptionalFormat(value2) {
  return IsUndefined(value2) || IsString(value2) && IsControlCharacterFree(value2);
}
function IsOptionalSchema(value2) {
  return IsUndefined(value2) || IsSchema2(value2);
}
function IsReadonly2(value2) {
  return IsObject(value2) && value2[ReadonlyKind] === "Readonly";
}
function IsOptional2(value2) {
  return IsObject(value2) && value2[OptionalKind] === "Optional";
}
function IsAny2(value2) {
  return IsKindOf2(value2, "Any") && IsOptionalString(value2.$id);
}
function IsArgument2(value2) {
  return IsKindOf2(value2, "Argument") && IsNumber(value2.index);
}
function IsArray4(value2) {
  return IsKindOf2(value2, "Array") && value2.type === "array" && IsOptionalString(value2.$id) && IsSchema2(value2.items) && IsOptionalNumber(value2.minItems) && IsOptionalNumber(value2.maxItems) && IsOptionalBoolean(value2.uniqueItems) && IsOptionalSchema(value2.contains) && IsOptionalNumber(value2.minContains) && IsOptionalNumber(value2.maxContains);
}
function IsAsyncIterator3(value2) {
  return IsKindOf2(value2, "AsyncIterator") && value2.type === "AsyncIterator" && IsOptionalString(value2.$id) && IsSchema2(value2.items);
}
function IsBigInt3(value2) {
  return IsKindOf2(value2, "BigInt") && value2.type === "bigint" && IsOptionalString(value2.$id) && IsOptionalBigInt(value2.exclusiveMaximum) && IsOptionalBigInt(value2.exclusiveMinimum) && IsOptionalBigInt(value2.maximum) && IsOptionalBigInt(value2.minimum) && IsOptionalBigInt(value2.multipleOf);
}
function IsBoolean3(value2) {
  return IsKindOf2(value2, "Boolean") && value2.type === "boolean" && IsOptionalString(value2.$id);
}
function IsComputed2(value2) {
  return IsKindOf2(value2, "Computed") && IsString(value2.target) && IsArray(value2.parameters) && value2.parameters.every((schema) => IsSchema2(schema));
}
function IsConstructor2(value2) {
  return IsKindOf2(value2, "Constructor") && value2.type === "Constructor" && IsOptionalString(value2.$id) && IsArray(value2.parameters) && value2.parameters.every((schema) => IsSchema2(schema)) && IsSchema2(value2.returns);
}
function IsDate3(value2) {
  return IsKindOf2(value2, "Date") && value2.type === "Date" && IsOptionalString(value2.$id) && IsOptionalNumber(value2.exclusiveMaximumTimestamp) && IsOptionalNumber(value2.exclusiveMinimumTimestamp) && IsOptionalNumber(value2.maximumTimestamp) && IsOptionalNumber(value2.minimumTimestamp) && IsOptionalNumber(value2.multipleOfTimestamp);
}
function IsFunction3(value2) {
  return IsKindOf2(value2, "Function") && value2.type === "Function" && IsOptionalString(value2.$id) && IsArray(value2.parameters) && value2.parameters.every((schema) => IsSchema2(schema)) && IsSchema2(value2.returns);
}
function IsImport(value2) {
  return IsKindOf2(value2, "Import") && HasPropertyKey(value2, "$defs") && IsObject(value2.$defs) && IsProperties(value2.$defs) && HasPropertyKey(value2, "$ref") && IsString(value2.$ref) && value2.$ref in value2.$defs;
}
function IsInteger2(value2) {
  return IsKindOf2(value2, "Integer") && value2.type === "integer" && IsOptionalString(value2.$id) && IsOptionalNumber(value2.exclusiveMaximum) && IsOptionalNumber(value2.exclusiveMinimum) && IsOptionalNumber(value2.maximum) && IsOptionalNumber(value2.minimum) && IsOptionalNumber(value2.multipleOf);
}
function IsProperties(value2) {
  return IsObject(value2) && Object.entries(value2).every(([key, schema]) => IsControlCharacterFree(key) && IsSchema2(schema));
}
function IsIntersect2(value2) {
  return IsKindOf2(value2, "Intersect") && (IsString(value2.type) && value2.type !== "object" ? false : true) && IsArray(value2.allOf) && value2.allOf.every((schema) => IsSchema2(schema) && !IsTransform2(schema)) && IsOptionalString(value2.type) && (IsOptionalBoolean(value2.unevaluatedProperties) || IsOptionalSchema(value2.unevaluatedProperties)) && IsOptionalString(value2.$id);
}
function IsIterator3(value2) {
  return IsKindOf2(value2, "Iterator") && value2.type === "Iterator" && IsOptionalString(value2.$id) && IsSchema2(value2.items);
}
function IsKindOf2(value2, kind) {
  return IsObject(value2) && Kind in value2 && value2[Kind] === kind;
}
function IsLiteralString(value2) {
  return IsLiteral2(value2) && IsString(value2.const);
}
function IsLiteralNumber(value2) {
  return IsLiteral2(value2) && IsNumber(value2.const);
}
function IsLiteralBoolean(value2) {
  return IsLiteral2(value2) && IsBoolean(value2.const);
}
function IsLiteral2(value2) {
  return IsKindOf2(value2, "Literal") && IsOptionalString(value2.$id) && IsLiteralValue2(value2.const);
}
function IsLiteralValue2(value2) {
  return IsBoolean(value2) || IsNumber(value2) || IsString(value2);
}
function IsMappedKey2(value2) {
  return IsKindOf2(value2, "MappedKey") && IsArray(value2.keys) && value2.keys.every((key) => IsNumber(key) || IsString(key));
}
function IsMappedResult2(value2) {
  return IsKindOf2(value2, "MappedResult") && IsProperties(value2.properties);
}
function IsNever2(value2) {
  return IsKindOf2(value2, "Never") && IsObject(value2.not) && Object.getOwnPropertyNames(value2.not).length === 0;
}
function IsNot2(value2) {
  return IsKindOf2(value2, "Not") && IsSchema2(value2.not);
}
function IsNull3(value2) {
  return IsKindOf2(value2, "Null") && value2.type === "null" && IsOptionalString(value2.$id);
}
function IsNumber4(value2) {
  return IsKindOf2(value2, "Number") && value2.type === "number" && IsOptionalString(value2.$id) && IsOptionalNumber(value2.exclusiveMaximum) && IsOptionalNumber(value2.exclusiveMinimum) && IsOptionalNumber(value2.maximum) && IsOptionalNumber(value2.minimum) && IsOptionalNumber(value2.multipleOf);
}
function IsObject4(value2) {
  return IsKindOf2(value2, "Object") && value2.type === "object" && IsOptionalString(value2.$id) && IsProperties(value2.properties) && IsAdditionalProperties(value2.additionalProperties) && IsOptionalNumber(value2.minProperties) && IsOptionalNumber(value2.maxProperties);
}
function IsPromise2(value2) {
  return IsKindOf2(value2, "Promise") && value2.type === "Promise" && IsOptionalString(value2.$id) && IsSchema2(value2.item);
}
function IsRecord2(value2) {
  return IsKindOf2(value2, "Record") && value2.type === "object" && IsOptionalString(value2.$id) && IsAdditionalProperties(value2.additionalProperties) && IsObject(value2.patternProperties) && ((schema) => {
    const keys = Object.getOwnPropertyNames(schema.patternProperties);
    return keys.length === 1 && IsPattern(keys[0]) && IsObject(schema.patternProperties) && IsSchema2(schema.patternProperties[keys[0]]);
  })(value2);
}
function IsRecursive(value2) {
  return IsObject(value2) && Hint in value2 && value2[Hint] === "Recursive";
}
function IsRef2(value2) {
  return IsKindOf2(value2, "Ref") && IsOptionalString(value2.$id) && IsString(value2.$ref);
}
function IsRegExp3(value2) {
  return IsKindOf2(value2, "RegExp") && IsOptionalString(value2.$id) && IsString(value2.source) && IsString(value2.flags) && IsOptionalNumber(value2.maxLength) && IsOptionalNumber(value2.minLength);
}
function IsString3(value2) {
  return IsKindOf2(value2, "String") && value2.type === "string" && IsOptionalString(value2.$id) && IsOptionalNumber(value2.minLength) && IsOptionalNumber(value2.maxLength) && IsOptionalPattern(value2.pattern) && IsOptionalFormat(value2.format);
}
function IsSymbol3(value2) {
  return IsKindOf2(value2, "Symbol") && value2.type === "symbol" && IsOptionalString(value2.$id);
}
function IsTemplateLiteral2(value2) {
  return IsKindOf2(value2, "TemplateLiteral") && value2.type === "string" && IsString(value2.pattern) && value2.pattern[0] === "^" && value2.pattern[value2.pattern.length - 1] === "$";
}
function IsThis2(value2) {
  return IsKindOf2(value2, "This") && IsOptionalString(value2.$id) && IsString(value2.$ref);
}
function IsTransform2(value2) {
  return IsObject(value2) && TransformKind in value2;
}
function IsTuple2(value2) {
  return IsKindOf2(value2, "Tuple") && value2.type === "array" && IsOptionalString(value2.$id) && IsNumber(value2.minItems) && IsNumber(value2.maxItems) && value2.minItems === value2.maxItems && (IsUndefined(value2.items) && IsUndefined(value2.additionalItems) && value2.minItems === 0 || IsArray(value2.items) && value2.items.every((schema) => IsSchema2(schema)));
}
function IsUndefined4(value2) {
  return IsKindOf2(value2, "Undefined") && value2.type === "undefined" && IsOptionalString(value2.$id);
}
function IsUnionLiteral(value2) {
  return IsUnion2(value2) && value2.anyOf.every((schema) => IsLiteralString(schema) || IsLiteralNumber(schema));
}
function IsUnion2(value2) {
  return IsKindOf2(value2, "Union") && IsOptionalString(value2.$id) && IsObject(value2) && IsArray(value2.anyOf) && value2.anyOf.every((schema) => IsSchema2(schema));
}
function IsUint8Array3(value2) {
  return IsKindOf2(value2, "Uint8Array") && value2.type === "Uint8Array" && IsOptionalString(value2.$id) && IsOptionalNumber(value2.minByteLength) && IsOptionalNumber(value2.maxByteLength);
}
function IsUnknown2(value2) {
  return IsKindOf2(value2, "Unknown") && IsOptionalString(value2.$id);
}
function IsUnsafe2(value2) {
  return IsKindOf2(value2, "Unsafe");
}
function IsVoid2(value2) {
  return IsKindOf2(value2, "Void") && value2.type === "void" && IsOptionalString(value2.$id);
}
function IsKind2(value2) {
  return IsObject(value2) && Kind in value2 && IsString(value2[Kind]) && !KnownTypes.includes(value2[Kind]);
}
function IsSchema2(value2) {
  return IsObject(value2) && (IsAny2(value2) || IsArgument2(value2) || IsArray4(value2) || IsBoolean3(value2) || IsBigInt3(value2) || IsAsyncIterator3(value2) || IsComputed2(value2) || IsConstructor2(value2) || IsDate3(value2) || IsFunction3(value2) || IsInteger2(value2) || IsIntersect2(value2) || IsIterator3(value2) || IsLiteral2(value2) || IsMappedKey2(value2) || IsMappedResult2(value2) || IsNever2(value2) || IsNot2(value2) || IsNull3(value2) || IsNumber4(value2) || IsObject4(value2) || IsPromise2(value2) || IsRecord2(value2) || IsRef2(value2) || IsRegExp3(value2) || IsString3(value2) || IsSymbol3(value2) || IsTemplateLiteral2(value2) || IsThis2(value2) || IsTuple2(value2) || IsUndefined4(value2) || IsUnion2(value2) || IsUint8Array3(value2) || IsUnknown2(value2) || IsUnsafe2(value2) || IsVoid2(value2) || IsKind2(value2));
}
var TypeGuardUnknownTypeError, KnownTypes;
var init_type3 = __esm(() => {
  init_symbols2();
  init_error2();
  TypeGuardUnknownTypeError = class TypeGuardUnknownTypeError extends TypeBoxError {
  };
  KnownTypes = [
    "Argument",
    "Any",
    "Array",
    "AsyncIterator",
    "BigInt",
    "Boolean",
    "Computed",
    "Constructor",
    "Date",
    "Enum",
    "Function",
    "Integer",
    "Intersect",
    "Iterator",
    "Literal",
    "MappedKey",
    "MappedResult",
    "Not",
    "Null",
    "Number",
    "Object",
    "Promise",
    "Record",
    "Ref",
    "RegExp",
    "String",
    "Symbol",
    "TemplateLiteral",
    "This",
    "Tuple",
    "Undefined",
    "Union",
    "Uint8Array",
    "Unknown",
    "Void"
  ];
});

// node_modules/@sinclair/typebox/build/esm/type/guard/index.mjs
var init_guard2 = __esm(() => {
  init_kind();
  init_type3();
});

// node_modules/@sinclair/typebox/build/esm/type/helpers/index.mjs
var init_helpers = () => {};

// node_modules/@sinclair/typebox/build/esm/type/patterns/patterns.mjs
var PatternBoolean = "(true|false)", PatternNumber = "(0|[1-9][0-9]*)", PatternString = "(.*)", PatternNever = "(?!.*)", PatternBooleanExact, PatternNumberExact, PatternStringExact, PatternNeverExact;
var init_patterns = __esm(() => {
  PatternBooleanExact = `^${PatternBoolean}$`;
  PatternNumberExact = `^${PatternNumber}$`;
  PatternStringExact = `^${PatternString}$`;
  PatternNeverExact = `^${PatternNever}$`;
});

// node_modules/@sinclair/typebox/build/esm/type/patterns/index.mjs
var init_patterns2 = __esm(() => {
  init_patterns();
});

// node_modules/@sinclair/typebox/build/esm/type/registry/format.mjs
var map;
var init_format = __esm(() => {
  map = new Map;
});

// node_modules/@sinclair/typebox/build/esm/type/registry/type.mjs
var map2;
var init_type4 = __esm(() => {
  map2 = new Map;
});

// node_modules/@sinclair/typebox/build/esm/type/registry/index.mjs
var init_registry = __esm(() => {
  init_format();
  init_type4();
});

// node_modules/@sinclair/typebox/build/esm/type/sets/set.mjs
function SetIncludes(T, S) {
  return T.includes(S);
}
function SetDistinct(T) {
  return [...new Set(T)];
}
function SetIntersect(T, S) {
  return T.filter((L) => S.includes(L));
}
function SetIntersectManyResolve(T, Init) {
  return T.reduce((Acc, L) => {
    return SetIntersect(Acc, L);
  }, Init);
}
function SetIntersectMany(T) {
  return T.length === 1 ? T[0] : T.length > 1 ? SetIntersectManyResolve(T.slice(1), T[0]) : [];
}
function SetUnionMany(T) {
  const Acc = [];
  for (const L of T)
    Acc.push(...L);
  return Acc;
}

// node_modules/@sinclair/typebox/build/esm/type/sets/index.mjs
var init_sets = () => {};

// node_modules/@sinclair/typebox/build/esm/type/any/any.mjs
function Any(options) {
  return CreateType({ [Kind]: "Any" }, options);
}
var init_any = __esm(() => {
  init_create();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/any/index.mjs
var init_any2 = __esm(() => {
  init_any();
});

// node_modules/@sinclair/typebox/build/esm/type/array/array.mjs
function Array2(items, options) {
  return CreateType({ [Kind]: "Array", type: "array", items }, options);
}
var init_array = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/array/index.mjs
var init_array2 = __esm(() => {
  init_array();
});

// node_modules/@sinclair/typebox/build/esm/type/argument/argument.mjs
function Argument(index) {
  return CreateType({ [Kind]: "Argument", index });
}
var init_argument = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/argument/index.mjs
var init_argument2 = __esm(() => {
  init_argument();
});

// node_modules/@sinclair/typebox/build/esm/type/async-iterator/async-iterator.mjs
function AsyncIterator(items, options) {
  return CreateType({ [Kind]: "AsyncIterator", type: "AsyncIterator", items }, options);
}
var init_async_iterator = __esm(() => {
  init_symbols2();
  init_type2();
});

// node_modules/@sinclair/typebox/build/esm/type/async-iterator/index.mjs
var init_async_iterator2 = __esm(() => {
  init_async_iterator();
});

// node_modules/@sinclair/typebox/build/esm/type/computed/computed.mjs
function Computed(target, parameters, options) {
  return CreateType({ [Kind]: "Computed", target, parameters }, options);
}
var init_computed = __esm(() => {
  init_create();
  init_symbols();
});

// node_modules/@sinclair/typebox/build/esm/type/computed/index.mjs
var init_computed2 = __esm(() => {
  init_computed();
});

// node_modules/@sinclair/typebox/build/esm/type/discard/discard.mjs
function DiscardKey(value2, key) {
  const { [key]: _, ...rest } = value2;
  return rest;
}
function Discard(value2, keys) {
  return keys.reduce((acc, key) => DiscardKey(acc, key), value2);
}

// node_modules/@sinclair/typebox/build/esm/type/discard/index.mjs
var init_discard = () => {};

// node_modules/@sinclair/typebox/build/esm/type/never/never.mjs
function Never(options) {
  return CreateType({ [Kind]: "Never", not: {} }, options);
}
var init_never = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/never/index.mjs
var init_never2 = __esm(() => {
  init_never();
});

// node_modules/@sinclair/typebox/build/esm/type/mapped/mapped-key.mjs
var init_mapped_key = () => {};

// node_modules/@sinclair/typebox/build/esm/type/mapped/mapped-result.mjs
function MappedResult(properties) {
  return CreateType({
    [Kind]: "MappedResult",
    properties
  });
}
var init_mapped_result = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/constructor/constructor.mjs
function Constructor(parameters, returns, options) {
  return CreateType({ [Kind]: "Constructor", type: "Constructor", parameters, returns }, options);
}
var init_constructor = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/constructor/index.mjs
var init_constructor2 = __esm(() => {
  init_constructor();
});

// node_modules/@sinclair/typebox/build/esm/type/function/function.mjs
function Function2(parameters, returns, options) {
  return CreateType({ [Kind]: "Function", type: "Function", parameters, returns }, options);
}
var init_function = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/function/index.mjs
var init_function2 = __esm(() => {
  init_function();
});

// node_modules/@sinclair/typebox/build/esm/type/union/union-create.mjs
function UnionCreate(T, options) {
  return CreateType({ [Kind]: "Union", anyOf: T }, options);
}
var init_union_create = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/union/union-evaluated.mjs
function IsUnionOptional(types) {
  return types.some((type3) => IsOptional(type3));
}
function RemoveOptionalFromRest(types) {
  return types.map((left) => IsOptional(left) ? RemoveOptionalFromType(left) : left);
}
function RemoveOptionalFromType(T) {
  return Discard(T, [OptionalKind]);
}
function ResolveUnion(types, options) {
  const isOptional = IsUnionOptional(types);
  return isOptional ? Optional(UnionCreate(RemoveOptionalFromRest(types), options)) : UnionCreate(RemoveOptionalFromRest(types), options);
}
function UnionEvaluated(T, options) {
  return T.length === 1 ? CreateType(T[0], options) : T.length === 0 ? Never(options) : ResolveUnion(T, options);
}
var init_union_evaluated = __esm(() => {
  init_type2();
  init_symbols2();
  init_discard();
  init_never2();
  init_optional2();
  init_union_create();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/union/union-type.mjs
var init_union_type = () => {};

// node_modules/@sinclair/typebox/build/esm/type/union/union.mjs
function Union(types, options) {
  return types.length === 0 ? Never(options) : types.length === 1 ? CreateType(types[0], options) : UnionCreate(types, options);
}
var init_union = __esm(() => {
  init_never2();
  init_type2();
  init_union_create();
});

// node_modules/@sinclair/typebox/build/esm/type/union/index.mjs
var init_union2 = __esm(() => {
  init_union_evaluated();
  init_union_type();
  init_union();
});

// node_modules/@sinclair/typebox/build/esm/type/template-literal/parse.mjs
function Unescape(pattern) {
  return pattern.replace(/\\\$/g, "$").replace(/\\\*/g, "*").replace(/\\\^/g, "^").replace(/\\\|/g, "|").replace(/\\\(/g, "(").replace(/\\\)/g, ")");
}
function IsNonEscaped(pattern, index, char) {
  return pattern[index] === char && pattern.charCodeAt(index - 1) !== 92;
}
function IsOpenParen(pattern, index) {
  return IsNonEscaped(pattern, index, "(");
}
function IsCloseParen(pattern, index) {
  return IsNonEscaped(pattern, index, ")");
}
function IsSeparator(pattern, index) {
  return IsNonEscaped(pattern, index, "|");
}
function IsGroup(pattern) {
  if (!(IsOpenParen(pattern, 0) && IsCloseParen(pattern, pattern.length - 1)))
    return false;
  let count = 0;
  for (let index = 0;index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      count += 1;
    if (IsCloseParen(pattern, index))
      count -= 1;
    if (count === 0 && index !== pattern.length - 1)
      return false;
  }
  return true;
}
function InGroup(pattern) {
  return pattern.slice(1, pattern.length - 1);
}
function IsPrecedenceOr(pattern) {
  let count = 0;
  for (let index = 0;index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      count += 1;
    if (IsCloseParen(pattern, index))
      count -= 1;
    if (IsSeparator(pattern, index) && count === 0)
      return true;
  }
  return false;
}
function IsPrecedenceAnd(pattern) {
  for (let index = 0;index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      return true;
  }
  return false;
}
function Or(pattern) {
  let [count, start] = [0, 0];
  const expressions = [];
  for (let index = 0;index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      count += 1;
    if (IsCloseParen(pattern, index))
      count -= 1;
    if (IsSeparator(pattern, index) && count === 0) {
      const range2 = pattern.slice(start, index);
      if (range2.length > 0)
        expressions.push(TemplateLiteralParse(range2));
      start = index + 1;
    }
  }
  const range = pattern.slice(start);
  if (range.length > 0)
    expressions.push(TemplateLiteralParse(range));
  if (expressions.length === 0)
    return { type: "const", const: "" };
  if (expressions.length === 1)
    return expressions[0];
  return { type: "or", expr: expressions };
}
function And(pattern) {
  function Group(value2, index) {
    if (!IsOpenParen(value2, index))
      throw new TemplateLiteralParserError(`TemplateLiteralParser: Index must point to open parens`);
    let count = 0;
    for (let scan = index;scan < value2.length; scan++) {
      if (IsOpenParen(value2, scan))
        count += 1;
      if (IsCloseParen(value2, scan))
        count -= 1;
      if (count === 0)
        return [index, scan];
    }
    throw new TemplateLiteralParserError(`TemplateLiteralParser: Unclosed group parens in expression`);
  }
  function Range(pattern2, index) {
    for (let scan = index;scan < pattern2.length; scan++) {
      if (IsOpenParen(pattern2, scan))
        return [index, scan];
    }
    return [index, pattern2.length];
  }
  const expressions = [];
  for (let index = 0;index < pattern.length; index++) {
    if (IsOpenParen(pattern, index)) {
      const [start, end] = Group(pattern, index);
      const range = pattern.slice(start, end + 1);
      expressions.push(TemplateLiteralParse(range));
      index = end;
    } else {
      const [start, end] = Range(pattern, index);
      const range = pattern.slice(start, end);
      if (range.length > 0)
        expressions.push(TemplateLiteralParse(range));
      index = end - 1;
    }
  }
  return expressions.length === 0 ? { type: "const", const: "" } : expressions.length === 1 ? expressions[0] : { type: "and", expr: expressions };
}
function TemplateLiteralParse(pattern) {
  return IsGroup(pattern) ? TemplateLiteralParse(InGroup(pattern)) : IsPrecedenceOr(pattern) ? Or(pattern) : IsPrecedenceAnd(pattern) ? And(pattern) : { type: "const", const: Unescape(pattern) };
}
function TemplateLiteralParseExact(pattern) {
  return TemplateLiteralParse(pattern.slice(1, pattern.length - 1));
}
var TemplateLiteralParserError;
var init_parse = __esm(() => {
  init_error2();
  TemplateLiteralParserError = class TemplateLiteralParserError extends TypeBoxError {
  };
});

// node_modules/@sinclair/typebox/build/esm/type/template-literal/finite.mjs
function IsNumberExpression(expression) {
  return expression.type === "or" && expression.expr.length === 2 && expression.expr[0].type === "const" && expression.expr[0].const === "0" && expression.expr[1].type === "const" && expression.expr[1].const === "[1-9][0-9]*";
}
function IsBooleanExpression(expression) {
  return expression.type === "or" && expression.expr.length === 2 && expression.expr[0].type === "const" && expression.expr[0].const === "true" && expression.expr[1].type === "const" && expression.expr[1].const === "false";
}
function IsStringExpression(expression) {
  return expression.type === "const" && expression.const === ".*";
}
function IsTemplateLiteralExpressionFinite(expression) {
  return IsNumberExpression(expression) || IsStringExpression(expression) ? false : IsBooleanExpression(expression) ? true : expression.type === "and" ? expression.expr.every((expr) => IsTemplateLiteralExpressionFinite(expr)) : expression.type === "or" ? expression.expr.every((expr) => IsTemplateLiteralExpressionFinite(expr)) : expression.type === "const" ? true : (() => {
    throw new TemplateLiteralFiniteError(`Unknown expression type`);
  })();
}
function IsTemplateLiteralFinite(schema) {
  const expression = TemplateLiteralParseExact(schema.pattern);
  return IsTemplateLiteralExpressionFinite(expression);
}
var TemplateLiteralFiniteError;
var init_finite = __esm(() => {
  init_parse();
  init_error2();
  TemplateLiteralFiniteError = class TemplateLiteralFiniteError extends TypeBoxError {
  };
});

// node_modules/@sinclair/typebox/build/esm/type/template-literal/generate.mjs
function* GenerateReduce(buffer) {
  if (buffer.length === 1)
    return yield* buffer[0];
  for (const left of buffer[0]) {
    for (const right of GenerateReduce(buffer.slice(1))) {
      yield `${left}${right}`;
    }
  }
}
function* GenerateAnd(expression) {
  return yield* GenerateReduce(expression.expr.map((expr) => [...TemplateLiteralExpressionGenerate(expr)]));
}
function* GenerateOr(expression) {
  for (const expr of expression.expr)
    yield* TemplateLiteralExpressionGenerate(expr);
}
function* GenerateConst(expression) {
  return yield expression.const;
}
function* TemplateLiteralExpressionGenerate(expression) {
  return expression.type === "and" ? yield* GenerateAnd(expression) : expression.type === "or" ? yield* GenerateOr(expression) : expression.type === "const" ? yield* GenerateConst(expression) : (() => {
    throw new TemplateLiteralGenerateError("Unknown expression");
  })();
}
function TemplateLiteralGenerate(schema) {
  const expression = TemplateLiteralParseExact(schema.pattern);
  return IsTemplateLiteralExpressionFinite(expression) ? [...TemplateLiteralExpressionGenerate(expression)] : [];
}
var TemplateLiteralGenerateError;
var init_generate = __esm(() => {
  init_finite();
  init_parse();
  init_error2();
  TemplateLiteralGenerateError = class TemplateLiteralGenerateError extends TypeBoxError {
  };
});

// node_modules/@sinclair/typebox/build/esm/type/literal/literal.mjs
function Literal(value2, options) {
  return CreateType({
    [Kind]: "Literal",
    const: value2,
    type: typeof value2
  }, options);
}
var init_literal = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/literal/index.mjs
var init_literal2 = __esm(() => {
  init_literal();
});

// node_modules/@sinclair/typebox/build/esm/type/boolean/boolean.mjs
function Boolean2(options) {
  return CreateType({ [Kind]: "Boolean", type: "boolean" }, options);
}
var init_boolean = __esm(() => {
  init_symbols2();
  init_create();
});

// node_modules/@sinclair/typebox/build/esm/type/boolean/index.mjs
var init_boolean2 = __esm(() => {
  init_boolean();
});

// node_modules/@sinclair/typebox/build/esm/type/bigint/bigint.mjs
function BigInt2(options) {
  return CreateType({ [Kind]: "BigInt", type: "bigint" }, options);
}
var init_bigint = __esm(() => {
  init_symbols2();
  init_create();
});

// node_modules/@sinclair/typebox/build/esm/type/bigint/index.mjs
var init_bigint2 = __esm(() => {
  init_bigint();
});

// node_modules/@sinclair/typebox/build/esm/type/number/number.mjs
function Number2(options) {
  return CreateType({ [Kind]: "Number", type: "number" }, options);
}
var init_number = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/number/index.mjs
var init_number2 = __esm(() => {
  init_number();
});

// node_modules/@sinclair/typebox/build/esm/type/string/string.mjs
function String2(options) {
  return CreateType({ [Kind]: "String", type: "string" }, options);
}
var init_string = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/string/index.mjs
var init_string2 = __esm(() => {
  init_string();
});

// node_modules/@sinclair/typebox/build/esm/type/template-literal/syntax.mjs
function* FromUnion(syntax) {
  const trim = syntax.trim().replace(/"|'/g, "");
  return trim === "boolean" ? yield Boolean2() : trim === "number" ? yield Number2() : trim === "bigint" ? yield BigInt2() : trim === "string" ? yield String2() : yield (() => {
    const literals = trim.split("|").map((literal2) => Literal(literal2.trim()));
    return literals.length === 0 ? Never() : literals.length === 1 ? literals[0] : UnionEvaluated(literals);
  })();
}
function* FromTerminal(syntax) {
  if (syntax[1] !== "{") {
    const L = Literal("$");
    const R = FromSyntax(syntax.slice(1));
    return yield* [L, ...R];
  }
  for (let i = 2;i < syntax.length; i++) {
    if (syntax[i] === "}") {
      const L = FromUnion(syntax.slice(2, i));
      const R = FromSyntax(syntax.slice(i + 1));
      return yield* [...L, ...R];
    }
  }
  yield Literal(syntax);
}
function* FromSyntax(syntax) {
  for (let i = 0;i < syntax.length; i++) {
    if (syntax[i] === "$") {
      const L = Literal(syntax.slice(0, i));
      const R = FromTerminal(syntax.slice(i));
      return yield* [L, ...R];
    }
  }
  yield Literal(syntax);
}
function TemplateLiteralSyntax(syntax) {
  return [...FromSyntax(syntax)];
}
var init_syntax = __esm(() => {
  init_literal2();
  init_boolean2();
  init_bigint2();
  init_number2();
  init_string2();
  init_union2();
  init_never2();
});

// node_modules/@sinclair/typebox/build/esm/type/template-literal/pattern.mjs
function Escape(value2) {
  return value2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Visit2(schema, acc) {
  return IsTemplateLiteral(schema) ? schema.pattern.slice(1, schema.pattern.length - 1) : IsUnion(schema) ? `(${schema.anyOf.map((schema2) => Visit2(schema2, acc)).join("|")})` : IsNumber3(schema) ? `${acc}${PatternNumber}` : IsInteger(schema) ? `${acc}${PatternNumber}` : IsBigInt2(schema) ? `${acc}${PatternNumber}` : IsString2(schema) ? `${acc}${PatternString}` : IsLiteral(schema) ? `${acc}${Escape(schema.const.toString())}` : IsBoolean2(schema) ? `${acc}${PatternBoolean}` : (() => {
    throw new TemplateLiteralPatternError(`Unexpected Kind '${schema[Kind]}'`);
  })();
}
function TemplateLiteralPattern(kinds) {
  return `^${kinds.map((schema) => Visit2(schema, "")).join("")}$`;
}
var TemplateLiteralPatternError;
var init_pattern = __esm(() => {
  init_patterns2();
  init_symbols2();
  init_error2();
  init_kind();
  TemplateLiteralPatternError = class TemplateLiteralPatternError extends TypeBoxError {
  };
});

// node_modules/@sinclair/typebox/build/esm/type/template-literal/union.mjs
function TemplateLiteralToUnion(schema) {
  const R = TemplateLiteralGenerate(schema);
  const L = R.map((S) => Literal(S));
  return UnionEvaluated(L);
}
var init_union3 = __esm(() => {
  init_union2();
  init_literal2();
  init_generate();
});

// node_modules/@sinclair/typebox/build/esm/type/template-literal/template-literal.mjs
function TemplateLiteral(unresolved, options) {
  const pattern = IsString(unresolved) ? TemplateLiteralPattern(TemplateLiteralSyntax(unresolved)) : TemplateLiteralPattern(unresolved);
  return CreateType({ [Kind]: "TemplateLiteral", type: "string", pattern }, options);
}
var init_template_literal = __esm(() => {
  init_type2();
  init_syntax();
  init_pattern();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/template-literal/index.mjs
var init_template_literal2 = __esm(() => {
  init_finite();
  init_generate();
  init_syntax();
  init_parse();
  init_pattern();
  init_union3();
  init_template_literal();
});

// node_modules/@sinclair/typebox/build/esm/type/indexed/indexed-property-keys.mjs
function FromTemplateLiteral(templateLiteral) {
  const keys = TemplateLiteralGenerate(templateLiteral);
  return keys.map((key) => key.toString());
}
function FromUnion2(types) {
  const result = [];
  for (const type3 of types)
    result.push(...IndexPropertyKeys(type3));
  return result;
}
function FromLiteral(literalValue) {
  return [literalValue.toString()];
}
function IndexPropertyKeys(type3) {
  return [...new Set(IsTemplateLiteral(type3) ? FromTemplateLiteral(type3) : IsUnion(type3) ? FromUnion2(type3.anyOf) : IsLiteral(type3) ? FromLiteral(type3.const) : IsNumber3(type3) ? ["[number]"] : IsInteger(type3) ? ["[number]"] : [])];
}
var init_indexed_property_keys = __esm(() => {
  init_template_literal2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/indexed/indexed-from-mapped-result.mjs
function FromProperties(type3, properties, options) {
  const result = {};
  for (const K2 of Object.getOwnPropertyNames(properties)) {
    result[K2] = Index(type3, IndexPropertyKeys(properties[K2]), options);
  }
  return result;
}
function FromMappedResult(type3, mappedResult, options) {
  return FromProperties(type3, mappedResult.properties, options);
}
function IndexFromMappedResult(type3, mappedResult, options) {
  const properties = FromMappedResult(type3, mappedResult, options);
  return MappedResult(properties);
}
var init_indexed_from_mapped_result = __esm(() => {
  init_mapped2();
  init_indexed_property_keys();
  init_indexed2();
});

// node_modules/@sinclair/typebox/build/esm/type/indexed/indexed.mjs
function FromRest(types, key) {
  return types.map((type3) => IndexFromPropertyKey(type3, key));
}
function FromIntersectRest(types) {
  return types.filter((type3) => !IsNever(type3));
}
function FromIntersect(types, key) {
  return IntersectEvaluated(FromIntersectRest(FromRest(types, key)));
}
function FromUnionRest(types) {
  return types.some((L) => IsNever(L)) ? [] : types;
}
function FromUnion3(types, key) {
  return UnionEvaluated(FromUnionRest(FromRest(types, key)));
}
function FromTuple(types, key) {
  return key in types ? types[key] : key === "[number]" ? UnionEvaluated(types) : Never();
}
function FromArray(type3, key) {
  return key === "[number]" ? type3 : Never();
}
function FromProperty(properties, propertyKey) {
  return propertyKey in properties ? properties[propertyKey] : Never();
}
function IndexFromPropertyKey(type3, propertyKey) {
  return IsIntersect(type3) ? FromIntersect(type3.allOf, propertyKey) : IsUnion(type3) ? FromUnion3(type3.anyOf, propertyKey) : IsTuple(type3) ? FromTuple(type3.items ?? [], propertyKey) : IsArray3(type3) ? FromArray(type3.items, propertyKey) : IsObject3(type3) ? FromProperty(type3.properties, propertyKey) : Never();
}
function IndexFromPropertyKeys(type3, propertyKeys) {
  return propertyKeys.map((propertyKey) => IndexFromPropertyKey(type3, propertyKey));
}
function FromSchema(type3, propertyKeys) {
  return UnionEvaluated(IndexFromPropertyKeys(type3, propertyKeys));
}
function Index(type3, key, options) {
  if (IsRef(type3) || IsRef(key)) {
    const error2 = `Index types using Ref parameters require both Type and Key to be of TSchema`;
    if (!IsSchema(type3) || !IsSchema(key))
      throw new TypeBoxError(error2);
    return Computed("Index", [type3, key]);
  }
  if (IsMappedResult(key))
    return IndexFromMappedResult(type3, key, options);
  if (IsMappedKey(key))
    return IndexFromMappedKey(type3, key, options);
  return CreateType(IsSchema(key) ? FromSchema(type3, IndexPropertyKeys(key)) : FromSchema(type3, key), options);
}
var init_indexed = __esm(() => {
  init_type2();
  init_error2();
  init_computed2();
  init_never2();
  init_intersect2();
  init_union2();
  init_indexed_property_keys();
  init_indexed_from_mapped_key();
  init_indexed_from_mapped_result();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/indexed/indexed-from-mapped-key.mjs
function MappedIndexPropertyKey(type3, key, options) {
  return { [key]: Index(type3, [key], Clone(options)) };
}
function MappedIndexPropertyKeys(type3, propertyKeys, options) {
  return propertyKeys.reduce((result, left) => {
    return { ...result, ...MappedIndexPropertyKey(type3, left, options) };
  }, {});
}
function MappedIndexProperties(type3, mappedKey, options) {
  return MappedIndexPropertyKeys(type3, mappedKey.keys, options);
}
function IndexFromMappedKey(type3, mappedKey, options) {
  const properties = MappedIndexProperties(type3, mappedKey, options);
  return MappedResult(properties);
}
var init_indexed_from_mapped_key = __esm(() => {
  init_indexed();
  init_mapped2();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/indexed/index.mjs
var init_indexed2 = __esm(() => {
  init_indexed_from_mapped_key();
  init_indexed_from_mapped_result();
  init_indexed_property_keys();
  init_indexed();
});

// node_modules/@sinclair/typebox/build/esm/type/iterator/iterator.mjs
function Iterator(items, options) {
  return CreateType({ [Kind]: "Iterator", type: "Iterator", items }, options);
}
var init_iterator = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/iterator/index.mjs
var init_iterator2 = __esm(() => {
  init_iterator();
});

// node_modules/@sinclair/typebox/build/esm/type/object/object.mjs
function RequiredArray(properties) {
  return globalThis.Object.keys(properties).filter((key) => !IsOptional(properties[key]));
}
function _Object(properties, options) {
  const required = RequiredArray(properties);
  const schema = required.length > 0 ? { [Kind]: "Object", type: "object", required, properties } : { [Kind]: "Object", type: "object", properties };
  return CreateType(schema, options);
}
var Object2;
var init_object = __esm(() => {
  init_type2();
  init_symbols2();
  init_kind();
  Object2 = _Object;
});

// node_modules/@sinclair/typebox/build/esm/type/object/index.mjs
var init_object2 = __esm(() => {
  init_object();
});

// node_modules/@sinclair/typebox/build/esm/type/promise/promise.mjs
function Promise2(item, options) {
  return CreateType({ [Kind]: "Promise", type: "Promise", item }, options);
}
var init_promise = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/promise/index.mjs
var init_promise2 = __esm(() => {
  init_promise();
});

// node_modules/@sinclair/typebox/build/esm/type/readonly/readonly.mjs
function RemoveReadonly(schema) {
  return CreateType(Discard(schema, [ReadonlyKind]));
}
function AddReadonly(schema) {
  return CreateType({ ...schema, [ReadonlyKind]: "Readonly" });
}
function ReadonlyWithFlag(schema, F) {
  return F === false ? RemoveReadonly(schema) : AddReadonly(schema);
}
function Readonly(schema, enable) {
  const F = enable ?? true;
  return IsMappedResult(schema) ? ReadonlyFromMappedResult(schema, F) : ReadonlyWithFlag(schema, F);
}
var init_readonly = __esm(() => {
  init_type2();
  init_symbols2();
  init_discard();
  init_readonly_from_mapped_result();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/readonly/readonly-from-mapped-result.mjs
function FromProperties2(K, F) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(K))
    Acc[K2] = Readonly(K[K2], F);
  return Acc;
}
function FromMappedResult2(R, F) {
  return FromProperties2(R.properties, F);
}
function ReadonlyFromMappedResult(R, F) {
  const P = FromMappedResult2(R, F);
  return MappedResult(P);
}
var init_readonly_from_mapped_result = __esm(() => {
  init_mapped2();
  init_readonly();
});

// node_modules/@sinclair/typebox/build/esm/type/readonly/index.mjs
var init_readonly2 = __esm(() => {
  init_readonly_from_mapped_result();
  init_readonly();
});

// node_modules/@sinclair/typebox/build/esm/type/tuple/tuple.mjs
function Tuple(types, options) {
  return CreateType(types.length > 0 ? { [Kind]: "Tuple", type: "array", items: types, additionalItems: false, minItems: types.length, maxItems: types.length } : { [Kind]: "Tuple", type: "array", minItems: types.length, maxItems: types.length }, options);
}
var init_tuple = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/tuple/index.mjs
var init_tuple2 = __esm(() => {
  init_tuple();
});

// node_modules/@sinclair/typebox/build/esm/type/mapped/mapped.mjs
function FromMappedResult3(K, P) {
  return K in P ? FromSchemaType(K, P[K]) : MappedResult(P);
}
function MappedKeyToKnownMappedResultProperties(K) {
  return { [K]: Literal(K) };
}
function MappedKeyToUnknownMappedResultProperties(P) {
  const Acc = {};
  for (const L of P)
    Acc[L] = Literal(L);
  return Acc;
}
function MappedKeyToMappedResultProperties(K, P) {
  return SetIncludes(P, K) ? MappedKeyToKnownMappedResultProperties(K) : MappedKeyToUnknownMappedResultProperties(P);
}
function FromMappedKey(K, P) {
  const R = MappedKeyToMappedResultProperties(K, P);
  return FromMappedResult3(K, R);
}
function FromRest2(K, T) {
  return T.map((L) => FromSchemaType(K, L));
}
function FromProperties3(K, T) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(T))
    Acc[K2] = FromSchemaType(K, T[K2]);
  return Acc;
}
function FromSchemaType(K, T) {
  const options = { ...T };
  return IsOptional(T) ? Optional(FromSchemaType(K, Discard(T, [OptionalKind]))) : IsReadonly(T) ? Readonly(FromSchemaType(K, Discard(T, [ReadonlyKind]))) : IsMappedResult(T) ? FromMappedResult3(K, T.properties) : IsMappedKey(T) ? FromMappedKey(K, T.keys) : IsConstructor(T) ? Constructor(FromRest2(K, T.parameters), FromSchemaType(K, T.returns), options) : IsFunction2(T) ? Function2(FromRest2(K, T.parameters), FromSchemaType(K, T.returns), options) : IsAsyncIterator2(T) ? AsyncIterator(FromSchemaType(K, T.items), options) : IsIterator2(T) ? Iterator(FromSchemaType(K, T.items), options) : IsIntersect(T) ? Intersect(FromRest2(K, T.allOf), options) : IsUnion(T) ? Union(FromRest2(K, T.anyOf), options) : IsTuple(T) ? Tuple(FromRest2(K, T.items ?? []), options) : IsObject3(T) ? Object2(FromProperties3(K, T.properties), options) : IsArray3(T) ? Array2(FromSchemaType(K, T.items), options) : IsPromise(T) ? Promise2(FromSchemaType(K, T.item), options) : T;
}
function MappedFunctionReturnType(K, T) {
  const Acc = {};
  for (const L of K)
    Acc[L] = FromSchemaType(L, T);
  return Acc;
}
function Mapped(key, map3, options) {
  const K = IsSchema(key) ? IndexPropertyKeys(key) : key;
  const RT = map3({ [Kind]: "MappedKey", keys: K });
  const R = MappedFunctionReturnType(K, RT);
  return Object2(R, options);
}
var init_mapped = __esm(() => {
  init_symbols2();
  init_discard();
  init_array2();
  init_async_iterator2();
  init_constructor2();
  init_function2();
  init_indexed2();
  init_intersect2();
  init_iterator2();
  init_literal2();
  init_object2();
  init_optional2();
  init_promise2();
  init_readonly2();
  init_tuple2();
  init_union2();
  init_sets();
  init_mapped_result();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/mapped/index.mjs
var init_mapped2 = __esm(() => {
  init_mapped_key();
  init_mapped_result();
  init_mapped();
});

// node_modules/@sinclair/typebox/build/esm/type/optional/optional.mjs
function RemoveOptional(schema) {
  return CreateType(Discard(schema, [OptionalKind]));
}
function AddOptional(schema) {
  return CreateType({ ...schema, [OptionalKind]: "Optional" });
}
function OptionalWithFlag(schema, F) {
  return F === false ? RemoveOptional(schema) : AddOptional(schema);
}
function Optional(schema, enable) {
  const F = enable ?? true;
  return IsMappedResult(schema) ? OptionalFromMappedResult(schema, F) : OptionalWithFlag(schema, F);
}
var init_optional = __esm(() => {
  init_type2();
  init_symbols2();
  init_discard();
  init_optional_from_mapped_result();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/optional/optional-from-mapped-result.mjs
function FromProperties4(P, F) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Optional(P[K2], F);
  return Acc;
}
function FromMappedResult4(R, F) {
  return FromProperties4(R.properties, F);
}
function OptionalFromMappedResult(R, F) {
  const P = FromMappedResult4(R, F);
  return MappedResult(P);
}
var init_optional_from_mapped_result = __esm(() => {
  init_mapped2();
  init_optional();
});

// node_modules/@sinclair/typebox/build/esm/type/optional/index.mjs
var init_optional2 = __esm(() => {
  init_optional_from_mapped_result();
  init_optional();
});

// node_modules/@sinclair/typebox/build/esm/type/intersect/intersect-create.mjs
function IntersectCreate(T, options = {}) {
  const allObjects = T.every((schema) => IsObject3(schema));
  const clonedUnevaluatedProperties = IsSchema(options.unevaluatedProperties) ? { unevaluatedProperties: options.unevaluatedProperties } : {};
  return CreateType(options.unevaluatedProperties === false || IsSchema(options.unevaluatedProperties) || allObjects ? { ...clonedUnevaluatedProperties, [Kind]: "Intersect", type: "object", allOf: T } : { ...clonedUnevaluatedProperties, [Kind]: "Intersect", allOf: T }, options);
}
var init_intersect_create = __esm(() => {
  init_type2();
  init_symbols2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/intersect/intersect-evaluated.mjs
function IsIntersectOptional(types) {
  return types.every((left) => IsOptional(left));
}
function RemoveOptionalFromType2(type3) {
  return Discard(type3, [OptionalKind]);
}
function RemoveOptionalFromRest2(types) {
  return types.map((left) => IsOptional(left) ? RemoveOptionalFromType2(left) : left);
}
function ResolveIntersect(types, options) {
  return IsIntersectOptional(types) ? Optional(IntersectCreate(RemoveOptionalFromRest2(types), options)) : IntersectCreate(RemoveOptionalFromRest2(types), options);
}
function IntersectEvaluated(types, options = {}) {
  if (types.length === 1)
    return CreateType(types[0], options);
  if (types.length === 0)
    return Never(options);
  if (types.some((schema) => IsTransform(schema)))
    throw new Error("Cannot intersect transform types");
  return ResolveIntersect(types, options);
}
var init_intersect_evaluated = __esm(() => {
  init_symbols2();
  init_type2();
  init_discard();
  init_never2();
  init_optional2();
  init_intersect_create();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/intersect/intersect-type.mjs
var init_intersect_type = () => {};

// node_modules/@sinclair/typebox/build/esm/type/intersect/intersect.mjs
function Intersect(types, options) {
  if (types.length === 1)
    return CreateType(types[0], options);
  if (types.length === 0)
    return Never(options);
  if (types.some((schema) => IsTransform(schema)))
    throw new Error("Cannot intersect transform types");
  return IntersectCreate(types, options);
}
var init_intersect = __esm(() => {
  init_type2();
  init_never2();
  init_intersect_create();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/intersect/index.mjs
var init_intersect2 = __esm(() => {
  init_intersect_evaluated();
  init_intersect_type();
  init_intersect();
});

// node_modules/@sinclair/typebox/build/esm/type/ref/ref.mjs
function Ref(...args) {
  const [$ref, options] = typeof args[0] === "string" ? [args[0], args[1]] : [args[0].$id, args[1]];
  if (typeof $ref !== "string")
    throw new TypeBoxError("Ref: $ref must be a string");
  return CreateType({ [Kind]: "Ref", $ref }, options);
}
var init_ref = __esm(() => {
  init_error2();
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/ref/index.mjs
var init_ref2 = __esm(() => {
  init_ref();
});

// node_modules/@sinclair/typebox/build/esm/type/awaited/awaited.mjs
function FromComputed(target, parameters) {
  return Computed("Awaited", [Computed(target, parameters)]);
}
function FromRef($ref) {
  return Computed("Awaited", [Ref($ref)]);
}
function FromIntersect2(types) {
  return Intersect(FromRest3(types));
}
function FromUnion4(types) {
  return Union(FromRest3(types));
}
function FromPromise(type3) {
  return Awaited(type3);
}
function FromRest3(types) {
  return types.map((type3) => Awaited(type3));
}
function Awaited(type3, options) {
  return CreateType(IsComputed(type3) ? FromComputed(type3.target, type3.parameters) : IsIntersect(type3) ? FromIntersect2(type3.allOf) : IsUnion(type3) ? FromUnion4(type3.anyOf) : IsPromise(type3) ? FromPromise(type3.item) : IsRef(type3) ? FromRef(type3.$ref) : type3, options);
}
var init_awaited = __esm(() => {
  init_type2();
  init_computed2();
  init_intersect2();
  init_union2();
  init_ref2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/awaited/index.mjs
var init_awaited2 = __esm(() => {
  init_awaited();
});

// node_modules/@sinclair/typebox/build/esm/type/keyof/keyof-property-keys.mjs
function FromRest4(types) {
  const result = [];
  for (const L of types)
    result.push(KeyOfPropertyKeys(L));
  return result;
}
function FromIntersect3(types) {
  const propertyKeysArray = FromRest4(types);
  const propertyKeys = SetUnionMany(propertyKeysArray);
  return propertyKeys;
}
function FromUnion5(types) {
  const propertyKeysArray = FromRest4(types);
  const propertyKeys = SetIntersectMany(propertyKeysArray);
  return propertyKeys;
}
function FromTuple2(types) {
  return types.map((_, indexer) => indexer.toString());
}
function FromArray2(_) {
  return ["[number]"];
}
function FromProperties5(T) {
  return globalThis.Object.getOwnPropertyNames(T);
}
function FromPatternProperties(patternProperties) {
  if (!includePatternProperties)
    return [];
  const patternPropertyKeys = globalThis.Object.getOwnPropertyNames(patternProperties);
  return patternPropertyKeys.map((key) => {
    return key[0] === "^" && key[key.length - 1] === "$" ? key.slice(1, key.length - 1) : key;
  });
}
function KeyOfPropertyKeys(type3) {
  return IsIntersect(type3) ? FromIntersect3(type3.allOf) : IsUnion(type3) ? FromUnion5(type3.anyOf) : IsTuple(type3) ? FromTuple2(type3.items ?? []) : IsArray3(type3) ? FromArray2(type3.items) : IsObject3(type3) ? FromProperties5(type3.properties) : IsRecord(type3) ? FromPatternProperties(type3.patternProperties) : [];
}
var includePatternProperties = false;
var init_keyof_property_keys = __esm(() => {
  init_sets();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/keyof/keyof.mjs
function FromComputed2(target, parameters) {
  return Computed("KeyOf", [Computed(target, parameters)]);
}
function FromRef2($ref) {
  return Computed("KeyOf", [Ref($ref)]);
}
function KeyOfFromType(type3, options) {
  const propertyKeys = KeyOfPropertyKeys(type3);
  const propertyKeyTypes = KeyOfPropertyKeysToRest(propertyKeys);
  const result = UnionEvaluated(propertyKeyTypes);
  return CreateType(result, options);
}
function KeyOfPropertyKeysToRest(propertyKeys) {
  return propertyKeys.map((L) => L === "[number]" ? Number2() : Literal(L));
}
function KeyOf(type3, options) {
  return IsComputed(type3) ? FromComputed2(type3.target, type3.parameters) : IsRef(type3) ? FromRef2(type3.$ref) : IsMappedResult(type3) ? KeyOfFromMappedResult(type3, options) : KeyOfFromType(type3, options);
}
var init_keyof = __esm(() => {
  init_type2();
  init_literal2();
  init_number2();
  init_computed2();
  init_ref2();
  init_keyof_property_keys();
  init_union2();
  init_keyof_from_mapped_result();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/keyof/keyof-from-mapped-result.mjs
function FromProperties6(properties, options) {
  const result = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(properties))
    result[K2] = KeyOf(properties[K2], Clone(options));
  return result;
}
function FromMappedResult5(mappedResult, options) {
  return FromProperties6(mappedResult.properties, options);
}
function KeyOfFromMappedResult(mappedResult, options) {
  const properties = FromMappedResult5(mappedResult, options);
  return MappedResult(properties);
}
var init_keyof_from_mapped_result = __esm(() => {
  init_mapped2();
  init_keyof();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/keyof/keyof-property-entries.mjs
var init_keyof_property_entries = () => {};

// node_modules/@sinclair/typebox/build/esm/type/keyof/index.mjs
var init_keyof2 = __esm(() => {
  init_keyof_from_mapped_result();
  init_keyof_property_entries();
  init_keyof_property_keys();
  init_keyof();
});

// node_modules/@sinclair/typebox/build/esm/type/composite/composite.mjs
function CompositeKeys(T) {
  const Acc = [];
  for (const L of T)
    Acc.push(...KeyOfPropertyKeys(L));
  return SetDistinct(Acc);
}
function FilterNever(T) {
  return T.filter((L) => !IsNever(L));
}
function CompositeProperty(T, K) {
  const Acc = [];
  for (const L of T)
    Acc.push(...IndexFromPropertyKeys(L, [K]));
  return FilterNever(Acc);
}
function CompositeProperties(T, K) {
  const Acc = {};
  for (const L of K) {
    Acc[L] = IntersectEvaluated(CompositeProperty(T, L));
  }
  return Acc;
}
function Composite(T, options) {
  const K = CompositeKeys(T);
  const P = CompositeProperties(T, K);
  const R = Object2(P, options);
  return R;
}
var init_composite = __esm(() => {
  init_intersect2();
  init_indexed2();
  init_keyof2();
  init_object2();
  init_sets();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/composite/index.mjs
var init_composite2 = __esm(() => {
  init_composite();
});

// node_modules/@sinclair/typebox/build/esm/type/date/date.mjs
function Date2(options) {
  return CreateType({ [Kind]: "Date", type: "Date" }, options);
}
var init_date = __esm(() => {
  init_symbols2();
  init_type2();
});

// node_modules/@sinclair/typebox/build/esm/type/date/index.mjs
var init_date2 = __esm(() => {
  init_date();
});

// node_modules/@sinclair/typebox/build/esm/type/null/null.mjs
function Null(options) {
  return CreateType({ [Kind]: "Null", type: "null" }, options);
}
var init_null = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/null/index.mjs
var init_null2 = __esm(() => {
  init_null();
});

// node_modules/@sinclair/typebox/build/esm/type/symbol/symbol.mjs
function Symbol2(options) {
  return CreateType({ [Kind]: "Symbol", type: "symbol" }, options);
}
var init_symbol = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/symbol/index.mjs
var init_symbol2 = __esm(() => {
  init_symbol();
});

// node_modules/@sinclair/typebox/build/esm/type/undefined/undefined.mjs
function Undefined(options) {
  return CreateType({ [Kind]: "Undefined", type: "undefined" }, options);
}
var init_undefined = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/undefined/index.mjs
var init_undefined2 = __esm(() => {
  init_undefined();
});

// node_modules/@sinclair/typebox/build/esm/type/uint8array/uint8array.mjs
function Uint8Array2(options) {
  return CreateType({ [Kind]: "Uint8Array", type: "Uint8Array" }, options);
}
var init_uint8array = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/uint8array/index.mjs
var init_uint8array2 = __esm(() => {
  init_uint8array();
});

// node_modules/@sinclair/typebox/build/esm/type/unknown/unknown.mjs
function Unknown(options) {
  return CreateType({ [Kind]: "Unknown" }, options);
}
var init_unknown = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/unknown/index.mjs
var init_unknown2 = __esm(() => {
  init_unknown();
});

// node_modules/@sinclair/typebox/build/esm/type/const/const.mjs
function FromArray3(T) {
  return T.map((L) => FromValue(L, false));
}
function FromProperties7(value2) {
  const Acc = {};
  for (const K of globalThis.Object.getOwnPropertyNames(value2))
    Acc[K] = Readonly(FromValue(value2[K], false));
  return Acc;
}
function ConditionalReadonly(T, root) {
  return root === true ? T : Readonly(T);
}
function FromValue(value2, root) {
  return IsAsyncIterator(value2) ? ConditionalReadonly(Any(), root) : IsIterator(value2) ? ConditionalReadonly(Any(), root) : IsArray(value2) ? Readonly(Tuple(FromArray3(value2))) : IsUint8Array(value2) ? Uint8Array2() : IsDate(value2) ? Date2() : IsObject(value2) ? ConditionalReadonly(Object2(FromProperties7(value2)), root) : IsFunction(value2) ? ConditionalReadonly(Function2([], Unknown()), root) : IsUndefined(value2) ? Undefined() : IsNull(value2) ? Null() : IsSymbol(value2) ? Symbol2() : IsBigInt(value2) ? BigInt2() : IsNumber(value2) ? Literal(value2) : IsBoolean(value2) ? Literal(value2) : IsString(value2) ? Literal(value2) : Object2({});
}
function Const(T, options) {
  return CreateType(FromValue(T, true), options);
}
var init_const = __esm(() => {
  init_any2();
  init_bigint2();
  init_date2();
  init_function2();
  init_literal2();
  init_null2();
  init_object2();
  init_symbol2();
  init_tuple2();
  init_readonly2();
  init_undefined2();
  init_uint8array2();
  init_unknown2();
  init_create();
});

// node_modules/@sinclair/typebox/build/esm/type/const/index.mjs
var init_const2 = __esm(() => {
  init_const();
});

// node_modules/@sinclair/typebox/build/esm/type/constructor-parameters/constructor-parameters.mjs
function ConstructorParameters(schema, options) {
  return IsConstructor(schema) ? Tuple(schema.parameters, options) : Never(options);
}
var init_constructor_parameters = __esm(() => {
  init_tuple2();
  init_never2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/constructor-parameters/index.mjs
var init_constructor_parameters2 = __esm(() => {
  init_constructor_parameters();
});

// node_modules/@sinclair/typebox/build/esm/type/enum/enum.mjs
function Enum(item, options) {
  if (IsUndefined(item))
    throw new Error("Enum undefined or empty");
  const values1 = globalThis.Object.getOwnPropertyNames(item).filter((key) => isNaN(key)).map((key) => item[key]);
  const values2 = [...new Set(values1)];
  const anyOf = values2.map((value2) => Literal(value2));
  return Union(anyOf, { ...options, [Hint]: "Enum" });
}
var init_enum = __esm(() => {
  init_literal2();
  init_symbols2();
  init_union2();
});

// node_modules/@sinclair/typebox/build/esm/type/enum/index.mjs
var init_enum2 = __esm(() => {
  init_enum();
});

// node_modules/@sinclair/typebox/build/esm/type/extends/extends-check.mjs
function IntoBooleanResult(result) {
  return result === ExtendsResult.False ? result : ExtendsResult.True;
}
function Throw(message) {
  throw new ExtendsResolverError(message);
}
function IsStructuralRight(right) {
  return exports_type.IsNever(right) || exports_type.IsIntersect(right) || exports_type.IsUnion(right) || exports_type.IsUnknown(right) || exports_type.IsAny(right);
}
function StructuralRight(left, right) {
  return exports_type.IsNever(right) ? FromNeverRight(left, right) : exports_type.IsIntersect(right) ? FromIntersectRight(left, right) : exports_type.IsUnion(right) ? FromUnionRight(left, right) : exports_type.IsUnknown(right) ? FromUnknownRight(left, right) : exports_type.IsAny(right) ? FromAnyRight(left, right) : Throw("StructuralRight");
}
function FromAnyRight(left, right) {
  return ExtendsResult.True;
}
function FromAny(left, right) {
  return exports_type.IsIntersect(right) ? FromIntersectRight(left, right) : exports_type.IsUnion(right) && right.anyOf.some((schema) => exports_type.IsAny(schema) || exports_type.IsUnknown(schema)) ? ExtendsResult.True : exports_type.IsUnion(right) ? ExtendsResult.Union : exports_type.IsUnknown(right) ? ExtendsResult.True : exports_type.IsAny(right) ? ExtendsResult.True : ExtendsResult.Union;
}
function FromArrayRight(left, right) {
  return exports_type.IsUnknown(left) ? ExtendsResult.False : exports_type.IsAny(left) ? ExtendsResult.Union : exports_type.IsNever(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromArray4(left, right) {
  return exports_type.IsObject(right) && IsObjectArrayLike(right) ? ExtendsResult.True : IsStructuralRight(right) ? StructuralRight(left, right) : !exports_type.IsArray(right) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.items, right.items));
}
function FromAsyncIterator(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : !exports_type.IsAsyncIterator(right) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.items, right.items));
}
function FromBigInt(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : exports_type.IsBigInt(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromBooleanRight(left, right) {
  return exports_type.IsLiteralBoolean(left) ? ExtendsResult.True : exports_type.IsBoolean(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromBoolean(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : exports_type.IsBoolean(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromConstructor(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : !exports_type.IsConstructor(right) ? ExtendsResult.False : left.parameters.length > right.parameters.length ? ExtendsResult.False : !left.parameters.every((schema, index) => IntoBooleanResult(Visit3(right.parameters[index], schema)) === ExtendsResult.True) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.returns, right.returns));
}
function FromDate(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : exports_type.IsDate(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromFunction(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : !exports_type.IsFunction(right) ? ExtendsResult.False : left.parameters.length > right.parameters.length ? ExtendsResult.False : !left.parameters.every((schema, index) => IntoBooleanResult(Visit3(right.parameters[index], schema)) === ExtendsResult.True) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.returns, right.returns));
}
function FromIntegerRight(left, right) {
  return exports_type.IsLiteral(left) && exports_value.IsNumber(left.const) ? ExtendsResult.True : exports_type.IsNumber(left) || exports_type.IsInteger(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromInteger(left, right) {
  return exports_type.IsInteger(right) || exports_type.IsNumber(right) ? ExtendsResult.True : IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : ExtendsResult.False;
}
function FromIntersectRight(left, right) {
  return right.allOf.every((schema) => Visit3(left, schema) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromIntersect4(left, right) {
  return left.allOf.some((schema) => Visit3(schema, right) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromIterator(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : !exports_type.IsIterator(right) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.items, right.items));
}
function FromLiteral2(left, right) {
  return exports_type.IsLiteral(right) && right.const === left.const ? ExtendsResult.True : IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : exports_type.IsString(right) ? FromStringRight(left, right) : exports_type.IsNumber(right) ? FromNumberRight(left, right) : exports_type.IsInteger(right) ? FromIntegerRight(left, right) : exports_type.IsBoolean(right) ? FromBooleanRight(left, right) : ExtendsResult.False;
}
function FromNeverRight(left, right) {
  return ExtendsResult.False;
}
function FromNever(left, right) {
  return ExtendsResult.True;
}
function UnwrapTNot(schema) {
  let [current, depth] = [schema, 0];
  while (true) {
    if (!exports_type.IsNot(current))
      break;
    current = current.not;
    depth += 1;
  }
  return depth % 2 === 0 ? current : Unknown();
}
function FromNot(left, right) {
  return exports_type.IsNot(left) ? Visit3(UnwrapTNot(left), right) : exports_type.IsNot(right) ? Visit3(left, UnwrapTNot(right)) : Throw("Invalid fallthrough for Not");
}
function FromNull(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : exports_type.IsNull(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromNumberRight(left, right) {
  return exports_type.IsLiteralNumber(left) ? ExtendsResult.True : exports_type.IsNumber(left) || exports_type.IsInteger(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromNumber(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : exports_type.IsInteger(right) || exports_type.IsNumber(right) ? ExtendsResult.True : ExtendsResult.False;
}
function IsObjectPropertyCount(schema, count) {
  return Object.getOwnPropertyNames(schema.properties).length === count;
}
function IsObjectStringLike(schema) {
  return IsObjectArrayLike(schema);
}
function IsObjectSymbolLike(schema) {
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "description" in schema.properties && exports_type.IsUnion(schema.properties.description) && schema.properties.description.anyOf.length === 2 && (exports_type.IsString(schema.properties.description.anyOf[0]) && exports_type.IsUndefined(schema.properties.description.anyOf[1]) || exports_type.IsString(schema.properties.description.anyOf[1]) && exports_type.IsUndefined(schema.properties.description.anyOf[0]));
}
function IsObjectNumberLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectBooleanLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectBigIntLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectDateLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectUint8ArrayLike(schema) {
  return IsObjectArrayLike(schema);
}
function IsObjectFunctionLike(schema) {
  const length = Number2();
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "length" in schema.properties && IntoBooleanResult(Visit3(schema.properties["length"], length)) === ExtendsResult.True;
}
function IsObjectConstructorLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectArrayLike(schema) {
  const length = Number2();
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "length" in schema.properties && IntoBooleanResult(Visit3(schema.properties["length"], length)) === ExtendsResult.True;
}
function IsObjectPromiseLike(schema) {
  const then = Function2([Any()], Any());
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "then" in schema.properties && IntoBooleanResult(Visit3(schema.properties["then"], then)) === ExtendsResult.True;
}
function Property(left, right) {
  return Visit3(left, right) === ExtendsResult.False ? ExtendsResult.False : exports_type.IsOptional(left) && !exports_type.IsOptional(right) ? ExtendsResult.False : ExtendsResult.True;
}
function FromObjectRight(left, right) {
  return exports_type.IsUnknown(left) ? ExtendsResult.False : exports_type.IsAny(left) ? ExtendsResult.Union : exports_type.IsNever(left) || exports_type.IsLiteralString(left) && IsObjectStringLike(right) || exports_type.IsLiteralNumber(left) && IsObjectNumberLike(right) || exports_type.IsLiteralBoolean(left) && IsObjectBooleanLike(right) || exports_type.IsSymbol(left) && IsObjectSymbolLike(right) || exports_type.IsBigInt(left) && IsObjectBigIntLike(right) || exports_type.IsString(left) && IsObjectStringLike(right) || exports_type.IsSymbol(left) && IsObjectSymbolLike(right) || exports_type.IsNumber(left) && IsObjectNumberLike(right) || exports_type.IsInteger(left) && IsObjectNumberLike(right) || exports_type.IsBoolean(left) && IsObjectBooleanLike(right) || exports_type.IsUint8Array(left) && IsObjectUint8ArrayLike(right) || exports_type.IsDate(left) && IsObjectDateLike(right) || exports_type.IsConstructor(left) && IsObjectConstructorLike(right) || exports_type.IsFunction(left) && IsObjectFunctionLike(right) ? ExtendsResult.True : exports_type.IsRecord(left) && exports_type.IsString(RecordKey(left)) ? (() => {
    return right[Hint] === "Record" ? ExtendsResult.True : ExtendsResult.False;
  })() : exports_type.IsRecord(left) && exports_type.IsNumber(RecordKey(left)) ? (() => {
    return IsObjectPropertyCount(right, 0) ? ExtendsResult.True : ExtendsResult.False;
  })() : ExtendsResult.False;
}
function FromObject(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : !exports_type.IsObject(right) ? ExtendsResult.False : (() => {
    for (const key of Object.getOwnPropertyNames(right.properties)) {
      if (!(key in left.properties) && !exports_type.IsOptional(right.properties[key])) {
        return ExtendsResult.False;
      }
      if (exports_type.IsOptional(right.properties[key])) {
        return ExtendsResult.True;
      }
      if (Property(left.properties[key], right.properties[key]) === ExtendsResult.False) {
        return ExtendsResult.False;
      }
    }
    return ExtendsResult.True;
  })();
}
function FromPromise2(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) && IsObjectPromiseLike(right) ? ExtendsResult.True : !exports_type.IsPromise(right) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.item, right.item));
}
function RecordKey(schema) {
  return PatternNumberExact in schema.patternProperties ? Number2() : (PatternStringExact in schema.patternProperties) ? String2() : Throw("Unknown record key pattern");
}
function RecordValue(schema) {
  return PatternNumberExact in schema.patternProperties ? schema.patternProperties[PatternNumberExact] : (PatternStringExact in schema.patternProperties) ? schema.patternProperties[PatternStringExact] : Throw("Unable to get record value schema");
}
function FromRecordRight(left, right) {
  const [Key, Value] = [RecordKey(right), RecordValue(right)];
  return exports_type.IsLiteralString(left) && exports_type.IsNumber(Key) && IntoBooleanResult(Visit3(left, Value)) === ExtendsResult.True ? ExtendsResult.True : exports_type.IsUint8Array(left) && exports_type.IsNumber(Key) ? Visit3(left, Value) : exports_type.IsString(left) && exports_type.IsNumber(Key) ? Visit3(left, Value) : exports_type.IsArray(left) && exports_type.IsNumber(Key) ? Visit3(left, Value) : exports_type.IsObject(left) ? (() => {
    for (const key of Object.getOwnPropertyNames(left.properties)) {
      if (Property(Value, left.properties[key]) === ExtendsResult.False) {
        return ExtendsResult.False;
      }
    }
    return ExtendsResult.True;
  })() : ExtendsResult.False;
}
function FromRecord(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : !exports_type.IsRecord(right) ? ExtendsResult.False : Visit3(RecordValue(left), RecordValue(right));
}
function FromRegExp(left, right) {
  const L = exports_type.IsRegExp(left) ? String2() : left;
  const R = exports_type.IsRegExp(right) ? String2() : right;
  return Visit3(L, R);
}
function FromStringRight(left, right) {
  return exports_type.IsLiteral(left) && exports_value.IsString(left.const) ? ExtendsResult.True : exports_type.IsString(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromString(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : exports_type.IsString(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromSymbol(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : exports_type.IsSymbol(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromTemplateLiteral2(left, right) {
  return exports_type.IsTemplateLiteral(left) ? Visit3(TemplateLiteralToUnion(left), right) : exports_type.IsTemplateLiteral(right) ? Visit3(left, TemplateLiteralToUnion(right)) : Throw("Invalid fallthrough for TemplateLiteral");
}
function IsArrayOfTuple(left, right) {
  return exports_type.IsArray(right) && left.items !== undefined && left.items.every((schema) => Visit3(schema, right.items) === ExtendsResult.True);
}
function FromTupleRight(left, right) {
  return exports_type.IsNever(left) ? ExtendsResult.True : exports_type.IsUnknown(left) ? ExtendsResult.False : exports_type.IsAny(left) ? ExtendsResult.Union : ExtendsResult.False;
}
function FromTuple3(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) && IsObjectArrayLike(right) ? ExtendsResult.True : exports_type.IsArray(right) && IsArrayOfTuple(left, right) ? ExtendsResult.True : !exports_type.IsTuple(right) ? ExtendsResult.False : exports_value.IsUndefined(left.items) && !exports_value.IsUndefined(right.items) || !exports_value.IsUndefined(left.items) && exports_value.IsUndefined(right.items) ? ExtendsResult.False : exports_value.IsUndefined(left.items) && !exports_value.IsUndefined(right.items) ? ExtendsResult.True : left.items.every((schema, index) => Visit3(schema, right.items[index]) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUint8Array(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : exports_type.IsUint8Array(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUndefined(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsRecord(right) ? FromRecordRight(left, right) : exports_type.IsVoid(right) ? FromVoidRight(left, right) : exports_type.IsUndefined(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUnionRight(left, right) {
  return right.anyOf.some((schema) => Visit3(left, schema) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUnion6(left, right) {
  return left.anyOf.every((schema) => Visit3(schema, right) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUnknownRight(left, right) {
  return ExtendsResult.True;
}
function FromUnknown(left, right) {
  return exports_type.IsNever(right) ? FromNeverRight(left, right) : exports_type.IsIntersect(right) ? FromIntersectRight(left, right) : exports_type.IsUnion(right) ? FromUnionRight(left, right) : exports_type.IsAny(right) ? FromAnyRight(left, right) : exports_type.IsString(right) ? FromStringRight(left, right) : exports_type.IsNumber(right) ? FromNumberRight(left, right) : exports_type.IsInteger(right) ? FromIntegerRight(left, right) : exports_type.IsBoolean(right) ? FromBooleanRight(left, right) : exports_type.IsArray(right) ? FromArrayRight(left, right) : exports_type.IsTuple(right) ? FromTupleRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsUnknown(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromVoidRight(left, right) {
  return exports_type.IsUndefined(left) ? ExtendsResult.True : exports_type.IsUndefined(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromVoid(left, right) {
  return exports_type.IsIntersect(right) ? FromIntersectRight(left, right) : exports_type.IsUnion(right) ? FromUnionRight(left, right) : exports_type.IsUnknown(right) ? FromUnknownRight(left, right) : exports_type.IsAny(right) ? FromAnyRight(left, right) : exports_type.IsObject(right) ? FromObjectRight(left, right) : exports_type.IsVoid(right) ? ExtendsResult.True : ExtendsResult.False;
}
function Visit3(left, right) {
  return exports_type.IsTemplateLiteral(left) || exports_type.IsTemplateLiteral(right) ? FromTemplateLiteral2(left, right) : exports_type.IsRegExp(left) || exports_type.IsRegExp(right) ? FromRegExp(left, right) : exports_type.IsNot(left) || exports_type.IsNot(right) ? FromNot(left, right) : exports_type.IsAny(left) ? FromAny(left, right) : exports_type.IsArray(left) ? FromArray4(left, right) : exports_type.IsBigInt(left) ? FromBigInt(left, right) : exports_type.IsBoolean(left) ? FromBoolean(left, right) : exports_type.IsAsyncIterator(left) ? FromAsyncIterator(left, right) : exports_type.IsConstructor(left) ? FromConstructor(left, right) : exports_type.IsDate(left) ? FromDate(left, right) : exports_type.IsFunction(left) ? FromFunction(left, right) : exports_type.IsInteger(left) ? FromInteger(left, right) : exports_type.IsIntersect(left) ? FromIntersect4(left, right) : exports_type.IsIterator(left) ? FromIterator(left, right) : exports_type.IsLiteral(left) ? FromLiteral2(left, right) : exports_type.IsNever(left) ? FromNever(left, right) : exports_type.IsNull(left) ? FromNull(left, right) : exports_type.IsNumber(left) ? FromNumber(left, right) : exports_type.IsObject(left) ? FromObject(left, right) : exports_type.IsRecord(left) ? FromRecord(left, right) : exports_type.IsString(left) ? FromString(left, right) : exports_type.IsSymbol(left) ? FromSymbol(left, right) : exports_type.IsTuple(left) ? FromTuple3(left, right) : exports_type.IsPromise(left) ? FromPromise2(left, right) : exports_type.IsUint8Array(left) ? FromUint8Array(left, right) : exports_type.IsUndefined(left) ? FromUndefined(left, right) : exports_type.IsUnion(left) ? FromUnion6(left, right) : exports_type.IsUnknown(left) ? FromUnknown(left, right) : exports_type.IsVoid(left) ? FromVoid(left, right) : Throw(`Unknown left type operand '${left[Kind]}'`);
}
function ExtendsCheck(left, right) {
  return Visit3(left, right);
}
var ExtendsResolverError, ExtendsResult;
var init_extends_check = __esm(() => {
  init_any2();
  init_function2();
  init_number2();
  init_string2();
  init_unknown2();
  init_template_literal2();
  init_patterns2();
  init_symbols2();
  init_error2();
  init_guard2();
  ExtendsResolverError = class ExtendsResolverError extends TypeBoxError {
  };
  (function(ExtendsResult2) {
    ExtendsResult2[ExtendsResult2["Union"] = 0] = "Union";
    ExtendsResult2[ExtendsResult2["True"] = 1] = "True";
    ExtendsResult2[ExtendsResult2["False"] = 2] = "False";
  })(ExtendsResult || (ExtendsResult = {}));
});

// node_modules/@sinclair/typebox/build/esm/type/extends/extends-from-mapped-result.mjs
function FromProperties8(P, Right, True, False, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Extends(P[K2], Right, True, False, Clone(options));
  return Acc;
}
function FromMappedResult6(Left, Right, True, False, options) {
  return FromProperties8(Left.properties, Right, True, False, options);
}
function ExtendsFromMappedResult(Left, Right, True, False, options) {
  const P = FromMappedResult6(Left, Right, True, False, options);
  return MappedResult(P);
}
var init_extends_from_mapped_result = __esm(() => {
  init_mapped2();
  init_extends();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/extends/extends.mjs
function ExtendsResolve(left, right, trueType, falseType) {
  const R = ExtendsCheck(left, right);
  return R === ExtendsResult.Union ? Union([trueType, falseType]) : R === ExtendsResult.True ? trueType : falseType;
}
function Extends(L, R, T, F, options) {
  return IsMappedResult(L) ? ExtendsFromMappedResult(L, R, T, F, options) : IsMappedKey(L) ? CreateType(ExtendsFromMappedKey(L, R, T, F, options)) : CreateType(ExtendsResolve(L, R, T, F), options);
}
var init_extends = __esm(() => {
  init_type2();
  init_union2();
  init_extends_check();
  init_extends_from_mapped_key();
  init_extends_from_mapped_result();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/extends/extends-from-mapped-key.mjs
function FromPropertyKey(K, U, L, R, options) {
  return {
    [K]: Extends(Literal(K), U, L, R, Clone(options))
  };
}
function FromPropertyKeys(K, U, L, R, options) {
  return K.reduce((Acc, LK) => {
    return { ...Acc, ...FromPropertyKey(LK, U, L, R, options) };
  }, {});
}
function FromMappedKey2(K, U, L, R, options) {
  return FromPropertyKeys(K.keys, U, L, R, options);
}
function ExtendsFromMappedKey(T, U, L, R, options) {
  const P = FromMappedKey2(T, U, L, R, options);
  return MappedResult(P);
}
var init_extends_from_mapped_key = __esm(() => {
  init_mapped2();
  init_literal2();
  init_extends();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/extends/extends-undefined.mjs
var init_extends_undefined = () => {};

// node_modules/@sinclair/typebox/build/esm/type/extends/index.mjs
var init_extends2 = __esm(() => {
  init_extends_check();
  init_extends_from_mapped_key();
  init_extends_from_mapped_result();
  init_extends_undefined();
  init_extends();
});

// node_modules/@sinclair/typebox/build/esm/type/exclude/exclude-from-template-literal.mjs
function ExcludeFromTemplateLiteral(L, R) {
  return Exclude(TemplateLiteralToUnion(L), R);
}
var init_exclude_from_template_literal = __esm(() => {
  init_exclude();
  init_template_literal2();
});

// node_modules/@sinclair/typebox/build/esm/type/exclude/exclude.mjs
function ExcludeRest(L, R) {
  const excluded = L.filter((inner) => ExtendsCheck(inner, R) === ExtendsResult.False);
  return excluded.length === 1 ? excluded[0] : Union(excluded);
}
function Exclude(L, R, options = {}) {
  if (IsTemplateLiteral(L))
    return CreateType(ExcludeFromTemplateLiteral(L, R), options);
  if (IsMappedResult(L))
    return CreateType(ExcludeFromMappedResult(L, R), options);
  return CreateType(IsUnion(L) ? ExcludeRest(L.anyOf, R) : ExtendsCheck(L, R) !== ExtendsResult.False ? Never() : L, options);
}
var init_exclude = __esm(() => {
  init_type2();
  init_union2();
  init_never2();
  init_extends2();
  init_exclude_from_mapped_result();
  init_exclude_from_template_literal();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/exclude/exclude-from-mapped-result.mjs
function FromProperties9(P, U) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Exclude(P[K2], U);
  return Acc;
}
function FromMappedResult7(R, T) {
  return FromProperties9(R.properties, T);
}
function ExcludeFromMappedResult(R, T) {
  const P = FromMappedResult7(R, T);
  return MappedResult(P);
}
var init_exclude_from_mapped_result = __esm(() => {
  init_mapped2();
  init_exclude();
});

// node_modules/@sinclair/typebox/build/esm/type/exclude/index.mjs
var init_exclude2 = __esm(() => {
  init_exclude_from_mapped_result();
  init_exclude_from_template_literal();
  init_exclude();
});

// node_modules/@sinclair/typebox/build/esm/type/extract/extract-from-template-literal.mjs
function ExtractFromTemplateLiteral(L, R) {
  return Extract(TemplateLiteralToUnion(L), R);
}
var init_extract_from_template_literal = __esm(() => {
  init_extract();
  init_template_literal2();
});

// node_modules/@sinclair/typebox/build/esm/type/extract/extract.mjs
function ExtractRest(L, R) {
  const extracted = L.filter((inner) => ExtendsCheck(inner, R) !== ExtendsResult.False);
  return extracted.length === 1 ? extracted[0] : Union(extracted);
}
function Extract(L, R, options) {
  if (IsTemplateLiteral(L))
    return CreateType(ExtractFromTemplateLiteral(L, R), options);
  if (IsMappedResult(L))
    return CreateType(ExtractFromMappedResult(L, R), options);
  return CreateType(IsUnion(L) ? ExtractRest(L.anyOf, R) : ExtendsCheck(L, R) !== ExtendsResult.False ? L : Never(), options);
}
var init_extract = __esm(() => {
  init_type2();
  init_union2();
  init_never2();
  init_extends2();
  init_extract_from_mapped_result();
  init_extract_from_template_literal();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/extract/extract-from-mapped-result.mjs
function FromProperties10(P, T) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Extract(P[K2], T);
  return Acc;
}
function FromMappedResult8(R, T) {
  return FromProperties10(R.properties, T);
}
function ExtractFromMappedResult(R, T) {
  const P = FromMappedResult8(R, T);
  return MappedResult(P);
}
var init_extract_from_mapped_result = __esm(() => {
  init_mapped2();
  init_extract();
});

// node_modules/@sinclair/typebox/build/esm/type/extract/index.mjs
var init_extract2 = __esm(() => {
  init_extract_from_mapped_result();
  init_extract_from_template_literal();
  init_extract();
});

// node_modules/@sinclair/typebox/build/esm/type/instance-type/instance-type.mjs
function InstanceType(schema, options) {
  return IsConstructor(schema) ? CreateType(schema.returns, options) : Never(options);
}
var init_instance_type = __esm(() => {
  init_type2();
  init_never2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/instance-type/index.mjs
var init_instance_type2 = __esm(() => {
  init_instance_type();
});

// node_modules/@sinclair/typebox/build/esm/type/readonly-optional/readonly-optional.mjs
function ReadonlyOptional(schema) {
  return Readonly(Optional(schema));
}
var init_readonly_optional = __esm(() => {
  init_readonly2();
  init_optional2();
});

// node_modules/@sinclair/typebox/build/esm/type/readonly-optional/index.mjs
var init_readonly_optional2 = __esm(() => {
  init_readonly_optional();
});

// node_modules/@sinclair/typebox/build/esm/type/record/record.mjs
function RecordCreateFromPattern(pattern2, T, options) {
  return CreateType({ [Kind]: "Record", type: "object", patternProperties: { [pattern2]: T } }, options);
}
function RecordCreateFromKeys(K, T, options) {
  const result = {};
  for (const K2 of K)
    result[K2] = T;
  return Object2(result, { ...options, [Hint]: "Record" });
}
function FromTemplateLiteralKey(K, T, options) {
  return IsTemplateLiteralFinite(K) ? RecordCreateFromKeys(IndexPropertyKeys(K), T, options) : RecordCreateFromPattern(K.pattern, T, options);
}
function FromUnionKey(key, type3, options) {
  return RecordCreateFromKeys(IndexPropertyKeys(Union(key)), type3, options);
}
function FromLiteralKey(key, type3, options) {
  return RecordCreateFromKeys([key.toString()], type3, options);
}
function FromRegExpKey(key, type3, options) {
  return RecordCreateFromPattern(key.source, type3, options);
}
function FromStringKey(key, type3, options) {
  const pattern2 = IsUndefined(key.pattern) ? PatternStringExact : key.pattern;
  return RecordCreateFromPattern(pattern2, type3, options);
}
function FromAnyKey(_, type3, options) {
  return RecordCreateFromPattern(PatternStringExact, type3, options);
}
function FromNeverKey(_key, type3, options) {
  return RecordCreateFromPattern(PatternNeverExact, type3, options);
}
function FromBooleanKey(_key, type3, options) {
  return Object2({ true: type3, false: type3 }, options);
}
function FromIntegerKey(_key, type3, options) {
  return RecordCreateFromPattern(PatternNumberExact, type3, options);
}
function FromNumberKey(_, type3, options) {
  return RecordCreateFromPattern(PatternNumberExact, type3, options);
}
function Record(key, type3, options = {}) {
  return IsUnion(key) ? FromUnionKey(key.anyOf, type3, options) : IsTemplateLiteral(key) ? FromTemplateLiteralKey(key, type3, options) : IsLiteral(key) ? FromLiteralKey(key.const, type3, options) : IsBoolean2(key) ? FromBooleanKey(key, type3, options) : IsInteger(key) ? FromIntegerKey(key, type3, options) : IsNumber3(key) ? FromNumberKey(key, type3, options) : IsRegExp2(key) ? FromRegExpKey(key, type3, options) : IsString2(key) ? FromStringKey(key, type3, options) : IsAny(key) ? FromAnyKey(key, type3, options) : IsNever(key) ? FromNeverKey(key, type3, options) : Never(options);
}
function RecordPattern(record) {
  return globalThis.Object.getOwnPropertyNames(record.patternProperties)[0];
}
function RecordKey2(type3) {
  const pattern2 = RecordPattern(type3);
  return pattern2 === PatternStringExact ? String2() : pattern2 === PatternNumberExact ? Number2() : String2({ pattern: pattern2 });
}
function RecordValue2(type3) {
  return type3.patternProperties[RecordPattern(type3)];
}
var init_record = __esm(() => {
  init_type2();
  init_symbols2();
  init_never2();
  init_number2();
  init_object2();
  init_string2();
  init_union2();
  init_template_literal2();
  init_patterns2();
  init_indexed2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/record/index.mjs
var init_record2 = __esm(() => {
  init_record();
});

// node_modules/@sinclair/typebox/build/esm/type/instantiate/instantiate.mjs
function FromConstructor2(args, type3) {
  type3.parameters = FromTypes(args, type3.parameters);
  type3.returns = FromType(args, type3.returns);
  return type3;
}
function FromFunction2(args, type3) {
  type3.parameters = FromTypes(args, type3.parameters);
  type3.returns = FromType(args, type3.returns);
  return type3;
}
function FromIntersect5(args, type3) {
  type3.allOf = FromTypes(args, type3.allOf);
  return type3;
}
function FromUnion7(args, type3) {
  type3.anyOf = FromTypes(args, type3.anyOf);
  return type3;
}
function FromTuple4(args, type3) {
  if (IsUndefined(type3.items))
    return type3;
  type3.items = FromTypes(args, type3.items);
  return type3;
}
function FromArray5(args, type3) {
  type3.items = FromType(args, type3.items);
  return type3;
}
function FromAsyncIterator2(args, type3) {
  type3.items = FromType(args, type3.items);
  return type3;
}
function FromIterator2(args, type3) {
  type3.items = FromType(args, type3.items);
  return type3;
}
function FromPromise3(args, type3) {
  type3.item = FromType(args, type3.item);
  return type3;
}
function FromObject2(args, type3) {
  const mappedProperties = FromProperties11(args, type3.properties);
  return { ...type3, ...Object2(mappedProperties) };
}
function FromRecord2(args, type3) {
  const mappedKey = FromType(args, RecordKey2(type3));
  const mappedValue = FromType(args, RecordValue2(type3));
  const result = Record(mappedKey, mappedValue);
  return { ...type3, ...result };
}
function FromArgument(args, argument2) {
  return argument2.index in args ? args[argument2.index] : Unknown();
}
function FromProperty2(args, type3) {
  const isReadonly = IsReadonly(type3);
  const isOptional = IsOptional(type3);
  const mapped2 = FromType(args, type3);
  return isReadonly && isOptional ? ReadonlyOptional(mapped2) : isReadonly && !isOptional ? Readonly(mapped2) : !isReadonly && isOptional ? Optional(mapped2) : mapped2;
}
function FromProperties11(args, properties) {
  return globalThis.Object.getOwnPropertyNames(properties).reduce((result, key) => {
    return { ...result, [key]: FromProperty2(args, properties[key]) };
  }, {});
}
function FromTypes(args, types) {
  return types.map((type3) => FromType(args, type3));
}
function FromType(args, type3) {
  return IsConstructor(type3) ? FromConstructor2(args, type3) : IsFunction2(type3) ? FromFunction2(args, type3) : IsIntersect(type3) ? FromIntersect5(args, type3) : IsUnion(type3) ? FromUnion7(args, type3) : IsTuple(type3) ? FromTuple4(args, type3) : IsArray3(type3) ? FromArray5(args, type3) : IsAsyncIterator2(type3) ? FromAsyncIterator2(args, type3) : IsIterator2(type3) ? FromIterator2(args, type3) : IsPromise(type3) ? FromPromise3(args, type3) : IsObject3(type3) ? FromObject2(args, type3) : IsRecord(type3) ? FromRecord2(args, type3) : IsArgument(type3) ? FromArgument(args, type3) : type3;
}
function Instantiate(type3, args) {
  return FromType(args, CloneType(type3));
}
var init_instantiate = __esm(() => {
  init_type();
  init_unknown2();
  init_readonly_optional2();
  init_readonly2();
  init_optional2();
  init_object2();
  init_record2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/instantiate/index.mjs
var init_instantiate2 = __esm(() => {
  init_instantiate();
});

// node_modules/@sinclair/typebox/build/esm/type/integer/integer.mjs
function Integer(options) {
  return CreateType({ [Kind]: "Integer", type: "integer" }, options);
}
var init_integer = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/integer/index.mjs
var init_integer2 = __esm(() => {
  init_integer();
});

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/intrinsic-from-mapped-key.mjs
function MappedIntrinsicPropertyKey(K, M, options) {
  return {
    [K]: Intrinsic(Literal(K), M, Clone(options))
  };
}
function MappedIntrinsicPropertyKeys(K, M, options) {
  const result = K.reduce((Acc, L) => {
    return { ...Acc, ...MappedIntrinsicPropertyKey(L, M, options) };
  }, {});
  return result;
}
function MappedIntrinsicProperties(T, M, options) {
  return MappedIntrinsicPropertyKeys(T["keys"], M, options);
}
function IntrinsicFromMappedKey(T, M, options) {
  const P = MappedIntrinsicProperties(T, M, options);
  return MappedResult(P);
}
var init_intrinsic_from_mapped_key = __esm(() => {
  init_mapped2();
  init_intrinsic();
  init_literal2();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/intrinsic.mjs
function ApplyUncapitalize(value2) {
  const [first, rest] = [value2.slice(0, 1), value2.slice(1)];
  return [first.toLowerCase(), rest].join("");
}
function ApplyCapitalize(value2) {
  const [first, rest] = [value2.slice(0, 1), value2.slice(1)];
  return [first.toUpperCase(), rest].join("");
}
function ApplyUppercase(value2) {
  return value2.toUpperCase();
}
function ApplyLowercase(value2) {
  return value2.toLowerCase();
}
function FromTemplateLiteral3(schema, mode, options) {
  const expression = TemplateLiteralParseExact(schema.pattern);
  const finite2 = IsTemplateLiteralExpressionFinite(expression);
  if (!finite2)
    return { ...schema, pattern: FromLiteralValue(schema.pattern, mode) };
  const strings = [...TemplateLiteralExpressionGenerate(expression)];
  const literals = strings.map((value2) => Literal(value2));
  const mapped2 = FromRest5(literals, mode);
  const union3 = Union(mapped2);
  return TemplateLiteral([union3], options);
}
function FromLiteralValue(value2, mode) {
  return typeof value2 === "string" ? mode === "Uncapitalize" ? ApplyUncapitalize(value2) : mode === "Capitalize" ? ApplyCapitalize(value2) : mode === "Uppercase" ? ApplyUppercase(value2) : mode === "Lowercase" ? ApplyLowercase(value2) : value2 : value2.toString();
}
function FromRest5(T, M) {
  return T.map((L) => Intrinsic(L, M));
}
function Intrinsic(schema, mode, options = {}) {
  return IsMappedKey(schema) ? IntrinsicFromMappedKey(schema, mode, options) : IsTemplateLiteral(schema) ? FromTemplateLiteral3(schema, mode, options) : IsUnion(schema) ? Union(FromRest5(schema.anyOf, mode), options) : IsLiteral(schema) ? Literal(FromLiteralValue(schema.const, mode), options) : CreateType(schema, options);
}
var init_intrinsic = __esm(() => {
  init_type2();
  init_template_literal2();
  init_intrinsic_from_mapped_key();
  init_literal2();
  init_union2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/capitalize.mjs
function Capitalize(T, options = {}) {
  return Intrinsic(T, "Capitalize", options);
}
var init_capitalize = __esm(() => {
  init_intrinsic();
});

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/lowercase.mjs
function Lowercase(T, options = {}) {
  return Intrinsic(T, "Lowercase", options);
}
var init_lowercase = __esm(() => {
  init_intrinsic();
});

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/uncapitalize.mjs
function Uncapitalize(T, options = {}) {
  return Intrinsic(T, "Uncapitalize", options);
}
var init_uncapitalize = __esm(() => {
  init_intrinsic();
});

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/uppercase.mjs
function Uppercase(T, options = {}) {
  return Intrinsic(T, "Uppercase", options);
}
var init_uppercase = __esm(() => {
  init_intrinsic();
});

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/index.mjs
var init_intrinsic2 = __esm(() => {
  init_capitalize();
  init_intrinsic_from_mapped_key();
  init_intrinsic();
  init_lowercase();
  init_uncapitalize();
  init_uppercase();
});

// node_modules/@sinclair/typebox/build/esm/type/omit/omit-from-mapped-result.mjs
function FromProperties12(properties, propertyKeys, options) {
  const result = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(properties))
    result[K2] = Omit(properties[K2], propertyKeys, Clone(options));
  return result;
}
function FromMappedResult9(mappedResult, propertyKeys, options) {
  return FromProperties12(mappedResult.properties, propertyKeys, options);
}
function OmitFromMappedResult(mappedResult, propertyKeys, options) {
  const properties = FromMappedResult9(mappedResult, propertyKeys, options);
  return MappedResult(properties);
}
var init_omit_from_mapped_result = __esm(() => {
  init_mapped2();
  init_omit();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/omit/omit.mjs
function FromIntersect6(types, propertyKeys) {
  return types.map((type3) => OmitResolve(type3, propertyKeys));
}
function FromUnion8(types, propertyKeys) {
  return types.map((type3) => OmitResolve(type3, propertyKeys));
}
function FromProperty3(properties, key) {
  const { [key]: _, ...R } = properties;
  return R;
}
function FromProperties13(properties, propertyKeys) {
  return propertyKeys.reduce((T, K2) => FromProperty3(T, K2), properties);
}
function FromObject3(type3, propertyKeys, properties) {
  const options = Discard(type3, [TransformKind, "$id", "required", "properties"]);
  const mappedProperties = FromProperties13(properties, propertyKeys);
  return Object2(mappedProperties, options);
}
function UnionFromPropertyKeys(propertyKeys) {
  const result = propertyKeys.reduce((result2, key) => IsLiteralValue(key) ? [...result2, Literal(key)] : result2, []);
  return Union(result);
}
function OmitResolve(type3, propertyKeys) {
  return IsIntersect(type3) ? Intersect(FromIntersect6(type3.allOf, propertyKeys)) : IsUnion(type3) ? Union(FromUnion8(type3.anyOf, propertyKeys)) : IsObject3(type3) ? FromObject3(type3, propertyKeys, type3.properties) : Object2({});
}
function Omit(type3, key, options) {
  const typeKey = IsArray(key) ? UnionFromPropertyKeys(key) : key;
  const propertyKeys = IsSchema(key) ? IndexPropertyKeys(key) : key;
  const isTypeRef = IsRef(type3);
  const isKeyRef = IsRef(key);
  return IsMappedResult(type3) ? OmitFromMappedResult(type3, propertyKeys, options) : IsMappedKey(key) ? OmitFromMappedKey(type3, key, options) : isTypeRef && isKeyRef ? Computed("Omit", [type3, typeKey], options) : !isTypeRef && isKeyRef ? Computed("Omit", [type3, typeKey], options) : isTypeRef && !isKeyRef ? Computed("Omit", [type3, typeKey], options) : CreateType({ ...OmitResolve(type3, propertyKeys), ...options });
}
var init_omit = __esm(() => {
  init_type2();
  init_symbols();
  init_computed2();
  init_literal2();
  init_indexed2();
  init_intersect2();
  init_union2();
  init_object2();
  init_omit_from_mapped_key();
  init_omit_from_mapped_result();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/omit/omit-from-mapped-key.mjs
function FromPropertyKey2(type3, key, options) {
  return { [key]: Omit(type3, [key], Clone(options)) };
}
function FromPropertyKeys2(type3, propertyKeys, options) {
  return propertyKeys.reduce((Acc, LK) => {
    return { ...Acc, ...FromPropertyKey2(type3, LK, options) };
  }, {});
}
function FromMappedKey3(type3, mappedKey, options) {
  return FromPropertyKeys2(type3, mappedKey.keys, options);
}
function OmitFromMappedKey(type3, mappedKey, options) {
  const properties = FromMappedKey3(type3, mappedKey, options);
  return MappedResult(properties);
}
var init_omit_from_mapped_key = __esm(() => {
  init_mapped2();
  init_omit();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/omit/index.mjs
var init_omit2 = __esm(() => {
  init_omit_from_mapped_key();
  init_omit_from_mapped_result();
  init_omit();
});

// node_modules/@sinclair/typebox/build/esm/type/pick/pick-from-mapped-result.mjs
function FromProperties14(properties, propertyKeys, options) {
  const result = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(properties))
    result[K2] = Pick(properties[K2], propertyKeys, Clone(options));
  return result;
}
function FromMappedResult10(mappedResult, propertyKeys, options) {
  return FromProperties14(mappedResult.properties, propertyKeys, options);
}
function PickFromMappedResult(mappedResult, propertyKeys, options) {
  const properties = FromMappedResult10(mappedResult, propertyKeys, options);
  return MappedResult(properties);
}
var init_pick_from_mapped_result = __esm(() => {
  init_mapped2();
  init_pick();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/pick/pick.mjs
function FromIntersect7(types, propertyKeys) {
  return types.map((type3) => PickResolve(type3, propertyKeys));
}
function FromUnion9(types, propertyKeys) {
  return types.map((type3) => PickResolve(type3, propertyKeys));
}
function FromProperties15(properties, propertyKeys) {
  const result = {};
  for (const K2 of propertyKeys)
    if (K2 in properties)
      result[K2] = properties[K2];
  return result;
}
function FromObject4(Type, keys, properties) {
  const options = Discard(Type, [TransformKind, "$id", "required", "properties"]);
  const mappedProperties = FromProperties15(properties, keys);
  return Object2(mappedProperties, options);
}
function UnionFromPropertyKeys2(propertyKeys) {
  const result = propertyKeys.reduce((result2, key) => IsLiteralValue(key) ? [...result2, Literal(key)] : result2, []);
  return Union(result);
}
function PickResolve(type3, propertyKeys) {
  return IsIntersect(type3) ? Intersect(FromIntersect7(type3.allOf, propertyKeys)) : IsUnion(type3) ? Union(FromUnion9(type3.anyOf, propertyKeys)) : IsObject3(type3) ? FromObject4(type3, propertyKeys, type3.properties) : Object2({});
}
function Pick(type3, key, options) {
  const typeKey = IsArray(key) ? UnionFromPropertyKeys2(key) : key;
  const propertyKeys = IsSchema(key) ? IndexPropertyKeys(key) : key;
  const isTypeRef = IsRef(type3);
  const isKeyRef = IsRef(key);
  return IsMappedResult(type3) ? PickFromMappedResult(type3, propertyKeys, options) : IsMappedKey(key) ? PickFromMappedKey(type3, key, options) : isTypeRef && isKeyRef ? Computed("Pick", [type3, typeKey], options) : !isTypeRef && isKeyRef ? Computed("Pick", [type3, typeKey], options) : isTypeRef && !isKeyRef ? Computed("Pick", [type3, typeKey], options) : CreateType({ ...PickResolve(type3, propertyKeys), ...options });
}
var init_pick = __esm(() => {
  init_type2();
  init_computed2();
  init_intersect2();
  init_literal2();
  init_object2();
  init_union2();
  init_indexed2();
  init_symbols();
  init_kind();
  init_pick_from_mapped_key();
  init_pick_from_mapped_result();
});

// node_modules/@sinclair/typebox/build/esm/type/pick/pick-from-mapped-key.mjs
function FromPropertyKey3(type3, key, options) {
  return {
    [key]: Pick(type3, [key], Clone(options))
  };
}
function FromPropertyKeys3(type3, propertyKeys, options) {
  return propertyKeys.reduce((result, leftKey) => {
    return { ...result, ...FromPropertyKey3(type3, leftKey, options) };
  }, {});
}
function FromMappedKey4(type3, mappedKey, options) {
  return FromPropertyKeys3(type3, mappedKey.keys, options);
}
function PickFromMappedKey(type3, mappedKey, options) {
  const properties = FromMappedKey4(type3, mappedKey, options);
  return MappedResult(properties);
}
var init_pick_from_mapped_key = __esm(() => {
  init_mapped2();
  init_pick();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/pick/index.mjs
var init_pick2 = __esm(() => {
  init_pick_from_mapped_key();
  init_pick_from_mapped_result();
  init_pick();
});

// node_modules/@sinclair/typebox/build/esm/type/partial/partial.mjs
function FromComputed3(target, parameters) {
  return Computed("Partial", [Computed(target, parameters)]);
}
function FromRef3($ref) {
  return Computed("Partial", [Ref($ref)]);
}
function FromProperties16(properties) {
  const partialProperties = {};
  for (const K of globalThis.Object.getOwnPropertyNames(properties))
    partialProperties[K] = Optional(properties[K]);
  return partialProperties;
}
function FromObject5(type3, properties) {
  const options = Discard(type3, [TransformKind, "$id", "required", "properties"]);
  const mappedProperties = FromProperties16(properties);
  return Object2(mappedProperties, options);
}
function FromRest6(types) {
  return types.map((type3) => PartialResolve(type3));
}
function PartialResolve(type3) {
  return IsComputed(type3) ? FromComputed3(type3.target, type3.parameters) : IsRef(type3) ? FromRef3(type3.$ref) : IsIntersect(type3) ? Intersect(FromRest6(type3.allOf)) : IsUnion(type3) ? Union(FromRest6(type3.anyOf)) : IsObject3(type3) ? FromObject5(type3, type3.properties) : IsBigInt2(type3) ? type3 : IsBoolean2(type3) ? type3 : IsInteger(type3) ? type3 : IsLiteral(type3) ? type3 : IsNull2(type3) ? type3 : IsNumber3(type3) ? type3 : IsString2(type3) ? type3 : IsSymbol2(type3) ? type3 : IsUndefined3(type3) ? type3 : Object2({});
}
function Partial(type3, options) {
  if (IsMappedResult(type3)) {
    return PartialFromMappedResult(type3, options);
  } else {
    return CreateType({ ...PartialResolve(type3), ...options });
  }
}
var init_partial = __esm(() => {
  init_type2();
  init_computed2();
  init_optional2();
  init_object2();
  init_intersect2();
  init_union2();
  init_ref2();
  init_discard();
  init_symbols2();
  init_partial_from_mapped_result();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/partial/partial-from-mapped-result.mjs
function FromProperties17(K, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(K))
    Acc[K2] = Partial(K[K2], Clone(options));
  return Acc;
}
function FromMappedResult11(R, options) {
  return FromProperties17(R.properties, options);
}
function PartialFromMappedResult(R, options) {
  const P = FromMappedResult11(R, options);
  return MappedResult(P);
}
var init_partial_from_mapped_result = __esm(() => {
  init_mapped2();
  init_partial();
  init_value();
});

// node_modules/@sinclair/typebox/build/esm/type/partial/index.mjs
var init_partial2 = __esm(() => {
  init_partial_from_mapped_result();
  init_partial();
});

// node_modules/@sinclair/typebox/build/esm/type/required/required.mjs
function FromComputed4(target, parameters) {
  return Computed("Required", [Computed(target, parameters)]);
}
function FromRef4($ref) {
  return Computed("Required", [Ref($ref)]);
}
function FromProperties18(properties) {
  const requiredProperties = {};
  for (const K of globalThis.Object.getOwnPropertyNames(properties))
    requiredProperties[K] = Discard(properties[K], [OptionalKind]);
  return requiredProperties;
}
function FromObject6(type3, properties) {
  const options = Discard(type3, [TransformKind, "$id", "required", "properties"]);
  const mappedProperties = FromProperties18(properties);
  return Object2(mappedProperties, options);
}
function FromRest7(types) {
  return types.map((type3) => RequiredResolve(type3));
}
function RequiredResolve(type3) {
  return IsComputed(type3) ? FromComputed4(type3.target, type3.parameters) : IsRef(type3) ? FromRef4(type3.$ref) : IsIntersect(type3) ? Intersect(FromRest7(type3.allOf)) : IsUnion(type3) ? Union(FromRest7(type3.anyOf)) : IsObject3(type3) ? FromObject6(type3, type3.properties) : IsBigInt2(type3) ? type3 : IsBoolean2(type3) ? type3 : IsInteger(type3) ? type3 : IsLiteral(type3) ? type3 : IsNull2(type3) ? type3 : IsNumber3(type3) ? type3 : IsString2(type3) ? type3 : IsSymbol2(type3) ? type3 : IsUndefined3(type3) ? type3 : Object2({});
}
function Required(type3, options) {
  if (IsMappedResult(type3)) {
    return RequiredFromMappedResult(type3, options);
  } else {
    return CreateType({ ...RequiredResolve(type3), ...options });
  }
}
var init_required = __esm(() => {
  init_type2();
  init_computed2();
  init_object2();
  init_intersect2();
  init_union2();
  init_ref2();
  init_symbols2();
  init_discard();
  init_required_from_mapped_result();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/required/required-from-mapped-result.mjs
function FromProperties19(P, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Required(P[K2], options);
  return Acc;
}
function FromMappedResult12(R, options) {
  return FromProperties19(R.properties, options);
}
function RequiredFromMappedResult(R, options) {
  const P = FromMappedResult12(R, options);
  return MappedResult(P);
}
var init_required_from_mapped_result = __esm(() => {
  init_mapped2();
  init_required();
});

// node_modules/@sinclair/typebox/build/esm/type/required/index.mjs
var init_required2 = __esm(() => {
  init_required_from_mapped_result();
  init_required();
});

// node_modules/@sinclair/typebox/build/esm/type/module/compute.mjs
function DereferenceParameters(moduleProperties, types) {
  return types.map((type3) => {
    return IsRef(type3) ? Dereference(moduleProperties, type3.$ref) : FromType2(moduleProperties, type3);
  });
}
function Dereference(moduleProperties, ref2) {
  return ref2 in moduleProperties ? IsRef(moduleProperties[ref2]) ? Dereference(moduleProperties, moduleProperties[ref2].$ref) : FromType2(moduleProperties, moduleProperties[ref2]) : Never();
}
function FromAwaited(parameters) {
  return Awaited(parameters[0]);
}
function FromIndex(parameters) {
  return Index(parameters[0], parameters[1]);
}
function FromKeyOf(parameters) {
  return KeyOf(parameters[0]);
}
function FromPartial(parameters) {
  return Partial(parameters[0]);
}
function FromOmit(parameters) {
  return Omit(parameters[0], parameters[1]);
}
function FromPick(parameters) {
  return Pick(parameters[0], parameters[1]);
}
function FromRequired(parameters) {
  return Required(parameters[0]);
}
function FromComputed5(moduleProperties, target, parameters) {
  const dereferenced = DereferenceParameters(moduleProperties, parameters);
  return target === "Awaited" ? FromAwaited(dereferenced) : target === "Index" ? FromIndex(dereferenced) : target === "KeyOf" ? FromKeyOf(dereferenced) : target === "Partial" ? FromPartial(dereferenced) : target === "Omit" ? FromOmit(dereferenced) : target === "Pick" ? FromPick(dereferenced) : target === "Required" ? FromRequired(dereferenced) : Never();
}
function FromArray6(moduleProperties, type3) {
  return Array2(FromType2(moduleProperties, type3));
}
function FromAsyncIterator3(moduleProperties, type3) {
  return AsyncIterator(FromType2(moduleProperties, type3));
}
function FromConstructor3(moduleProperties, parameters, instanceType) {
  return Constructor(FromTypes2(moduleProperties, parameters), FromType2(moduleProperties, instanceType));
}
function FromFunction3(moduleProperties, parameters, returnType) {
  return Function2(FromTypes2(moduleProperties, parameters), FromType2(moduleProperties, returnType));
}
function FromIntersect8(moduleProperties, types) {
  return Intersect(FromTypes2(moduleProperties, types));
}
function FromIterator3(moduleProperties, type3) {
  return Iterator(FromType2(moduleProperties, type3));
}
function FromObject7(moduleProperties, properties) {
  return Object2(globalThis.Object.keys(properties).reduce((result, key) => {
    return { ...result, [key]: FromType2(moduleProperties, properties[key]) };
  }, {}));
}
function FromRecord3(moduleProperties, type3) {
  const [value2, pattern2] = [FromType2(moduleProperties, RecordValue2(type3)), RecordPattern(type3)];
  const result = CloneType(type3);
  result.patternProperties[pattern2] = value2;
  return result;
}
function FromTransform(moduleProperties, transform) {
  return IsRef(transform) ? { ...Dereference(moduleProperties, transform.$ref), [TransformKind]: transform[TransformKind] } : transform;
}
function FromTuple5(moduleProperties, types) {
  return Tuple(FromTypes2(moduleProperties, types));
}
function FromUnion10(moduleProperties, types) {
  return Union(FromTypes2(moduleProperties, types));
}
function FromTypes2(moduleProperties, types) {
  return types.map((type3) => FromType2(moduleProperties, type3));
}
function FromType2(moduleProperties, type3) {
  return IsOptional(type3) ? CreateType(FromType2(moduleProperties, Discard(type3, [OptionalKind])), type3) : IsReadonly(type3) ? CreateType(FromType2(moduleProperties, Discard(type3, [ReadonlyKind])), type3) : IsTransform(type3) ? CreateType(FromTransform(moduleProperties, type3), type3) : IsArray3(type3) ? CreateType(FromArray6(moduleProperties, type3.items), type3) : IsAsyncIterator2(type3) ? CreateType(FromAsyncIterator3(moduleProperties, type3.items), type3) : IsComputed(type3) ? CreateType(FromComputed5(moduleProperties, type3.target, type3.parameters)) : IsConstructor(type3) ? CreateType(FromConstructor3(moduleProperties, type3.parameters, type3.returns), type3) : IsFunction2(type3) ? CreateType(FromFunction3(moduleProperties, type3.parameters, type3.returns), type3) : IsIntersect(type3) ? CreateType(FromIntersect8(moduleProperties, type3.allOf), type3) : IsIterator2(type3) ? CreateType(FromIterator3(moduleProperties, type3.items), type3) : IsObject3(type3) ? CreateType(FromObject7(moduleProperties, type3.properties), type3) : IsRecord(type3) ? CreateType(FromRecord3(moduleProperties, type3)) : IsTuple(type3) ? CreateType(FromTuple5(moduleProperties, type3.items || []), type3) : IsUnion(type3) ? CreateType(FromUnion10(moduleProperties, type3.anyOf), type3) : type3;
}
function ComputeType(moduleProperties, key) {
  return key in moduleProperties ? FromType2(moduleProperties, moduleProperties[key]) : Never();
}
function ComputeModuleProperties(moduleProperties) {
  return globalThis.Object.getOwnPropertyNames(moduleProperties).reduce((result, key) => {
    return { ...result, [key]: ComputeType(moduleProperties, key) };
  }, {});
}
var init_compute = __esm(() => {
  init_create();
  init_clone();
  init_discard();
  init_array2();
  init_awaited2();
  init_async_iterator2();
  init_constructor2();
  init_indexed2();
  init_function2();
  init_intersect2();
  init_iterator2();
  init_keyof2();
  init_object2();
  init_omit2();
  init_pick2();
  init_never2();
  init_partial2();
  init_record2();
  init_required2();
  init_tuple2();
  init_union2();
  init_symbols2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/module/module.mjs
class TModule {
  constructor($defs) {
    const computed2 = ComputeModuleProperties($defs);
    const identified = this.WithIdentifiers(computed2);
    this.$defs = identified;
  }
  Import(key, options) {
    const $defs = { ...this.$defs, [key]: CreateType(this.$defs[key], options) };
    return CreateType({ [Kind]: "Import", $defs, $ref: key });
  }
  WithIdentifiers($defs) {
    return globalThis.Object.getOwnPropertyNames($defs).reduce((result, key) => {
      return { ...result, [key]: { ...$defs[key], $id: key } };
    }, {});
  }
}
function Module(properties) {
  return new TModule(properties);
}
var init_module = __esm(() => {
  init_create();
  init_symbols2();
  init_compute();
});

// node_modules/@sinclair/typebox/build/esm/type/module/index.mjs
var init_module2 = __esm(() => {
  init_module();
});

// node_modules/@sinclair/typebox/build/esm/type/not/not.mjs
function Not(type3, options) {
  return CreateType({ [Kind]: "Not", not: type3 }, options);
}
var init_not = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/not/index.mjs
var init_not2 = __esm(() => {
  init_not();
});

// node_modules/@sinclair/typebox/build/esm/type/parameters/parameters.mjs
function Parameters(schema, options) {
  return IsFunction2(schema) ? Tuple(schema.parameters, options) : Never();
}
var init_parameters = __esm(() => {
  init_tuple2();
  init_never2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/parameters/index.mjs
var init_parameters2 = __esm(() => {
  init_parameters();
});

// node_modules/@sinclair/typebox/build/esm/type/recursive/recursive.mjs
function Recursive(callback, options = {}) {
  if (IsUndefined(options.$id))
    options.$id = `T${Ordinal++}`;
  const thisType = CloneType(callback({ [Kind]: "This", $ref: `${options.$id}` }));
  thisType.$id = options.$id;
  return CreateType({ [Hint]: "Recursive", ...thisType }, options);
}
var Ordinal = 0;
var init_recursive = __esm(() => {
  init_type();
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/recursive/index.mjs
var init_recursive2 = __esm(() => {
  init_recursive();
});

// node_modules/@sinclair/typebox/build/esm/type/regexp/regexp.mjs
function RegExp2(unresolved, options) {
  const expr = IsString(unresolved) ? new globalThis.RegExp(unresolved) : unresolved;
  return CreateType({ [Kind]: "RegExp", type: "RegExp", source: expr.source, flags: expr.flags }, options);
}
var init_regexp = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/regexp/index.mjs
var init_regexp2 = __esm(() => {
  init_regexp();
});

// node_modules/@sinclair/typebox/build/esm/type/rest/rest.mjs
function RestResolve(T) {
  return IsIntersect(T) ? T.allOf : IsUnion(T) ? T.anyOf : IsTuple(T) ? T.items ?? [] : [];
}
function Rest(T) {
  return RestResolve(T);
}
var init_rest = __esm(() => {
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/rest/index.mjs
var init_rest2 = __esm(() => {
  init_rest();
});

// node_modules/@sinclair/typebox/build/esm/type/return-type/return-type.mjs
function ReturnType(schema, options) {
  return IsFunction2(schema) ? CreateType(schema.returns, options) : Never(options);
}
var init_return_type = __esm(() => {
  init_type2();
  init_never2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/return-type/index.mjs
var init_return_type2 = __esm(() => {
  init_return_type();
});

// node_modules/@sinclair/typebox/build/esm/type/schema/anyschema.mjs
var init_anyschema = () => {};

// node_modules/@sinclair/typebox/build/esm/type/schema/schema.mjs
var init_schema = () => {};

// node_modules/@sinclair/typebox/build/esm/type/schema/index.mjs
var init_schema2 = __esm(() => {
  init_anyschema();
  init_schema();
});

// node_modules/@sinclair/typebox/build/esm/type/static/static.mjs
var init_static = () => {};

// node_modules/@sinclair/typebox/build/esm/type/static/index.mjs
var init_static2 = __esm(() => {
  init_static();
});

// node_modules/@sinclair/typebox/build/esm/type/transform/transform.mjs
class TransformDecodeBuilder {
  constructor(schema2) {
    this.schema = schema2;
  }
  Decode(decode) {
    return new TransformEncodeBuilder(this.schema, decode);
  }
}

class TransformEncodeBuilder {
  constructor(schema2, decode) {
    this.schema = schema2;
    this.decode = decode;
  }
  EncodeTransform(encode, schema2) {
    const Encode = (value2) => schema2[TransformKind].Encode(encode(value2));
    const Decode = (value2) => this.decode(schema2[TransformKind].Decode(value2));
    const Codec = { Encode, Decode };
    return { ...schema2, [TransformKind]: Codec };
  }
  EncodeSchema(encode, schema2) {
    const Codec = { Decode: this.decode, Encode: encode };
    return { ...schema2, [TransformKind]: Codec };
  }
  Encode(encode) {
    return IsTransform(this.schema) ? this.EncodeTransform(encode, this.schema) : this.EncodeSchema(encode, this.schema);
  }
}
function Transform(schema2) {
  return new TransformDecodeBuilder(schema2);
}
var init_transform = __esm(() => {
  init_symbols2();
  init_kind();
});

// node_modules/@sinclair/typebox/build/esm/type/transform/index.mjs
var init_transform2 = __esm(() => {
  init_transform();
});

// node_modules/@sinclair/typebox/build/esm/type/unsafe/unsafe.mjs
function Unsafe(options = {}) {
  return CreateType({ [Kind]: options[Kind] ?? "Unsafe" }, options);
}
var init_unsafe = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/unsafe/index.mjs
var init_unsafe2 = __esm(() => {
  init_unsafe();
});

// node_modules/@sinclair/typebox/build/esm/type/void/void.mjs
function Void(options) {
  return CreateType({ [Kind]: "Void", type: "void" }, options);
}
var init_void = __esm(() => {
  init_type2();
  init_symbols2();
});

// node_modules/@sinclair/typebox/build/esm/type/void/index.mjs
var init_void2 = __esm(() => {
  init_void();
});

// node_modules/@sinclair/typebox/build/esm/type/type/type.mjs
var exports_type3 = {};
__export(exports_type3, {
  Void: () => Void,
  Uppercase: () => Uppercase,
  Unsafe: () => Unsafe,
  Unknown: () => Unknown,
  Union: () => Union,
  Undefined: () => Undefined,
  Uncapitalize: () => Uncapitalize,
  Uint8Array: () => Uint8Array2,
  Tuple: () => Tuple,
  Transform: () => Transform,
  TemplateLiteral: () => TemplateLiteral,
  Symbol: () => Symbol2,
  String: () => String2,
  ReturnType: () => ReturnType,
  Rest: () => Rest,
  Required: () => Required,
  RegExp: () => RegExp2,
  Ref: () => Ref,
  Recursive: () => Recursive,
  Record: () => Record,
  ReadonlyOptional: () => ReadonlyOptional,
  Readonly: () => Readonly,
  Promise: () => Promise2,
  Pick: () => Pick,
  Partial: () => Partial,
  Parameters: () => Parameters,
  Optional: () => Optional,
  Omit: () => Omit,
  Object: () => Object2,
  Number: () => Number2,
  Null: () => Null,
  Not: () => Not,
  Never: () => Never,
  Module: () => Module,
  Mapped: () => Mapped,
  Lowercase: () => Lowercase,
  Literal: () => Literal,
  KeyOf: () => KeyOf,
  Iterator: () => Iterator,
  Intersect: () => Intersect,
  Integer: () => Integer,
  Instantiate: () => Instantiate,
  InstanceType: () => InstanceType,
  Index: () => Index,
  Function: () => Function2,
  Extract: () => Extract,
  Extends: () => Extends,
  Exclude: () => Exclude,
  Enum: () => Enum,
  Date: () => Date2,
  ConstructorParameters: () => ConstructorParameters,
  Constructor: () => Constructor,
  Const: () => Const,
  Composite: () => Composite,
  Capitalize: () => Capitalize,
  Boolean: () => Boolean2,
  BigInt: () => BigInt2,
  Awaited: () => Awaited,
  AsyncIterator: () => AsyncIterator,
  Array: () => Array2,
  Argument: () => Argument,
  Any: () => Any
});
var init_type5 = __esm(() => {
  init_any2();
  init_argument2();
  init_array2();
  init_async_iterator2();
  init_awaited2();
  init_bigint2();
  init_boolean2();
  init_composite2();
  init_const2();
  init_constructor2();
  init_constructor_parameters2();
  init_date2();
  init_enum2();
  init_exclude2();
  init_extends2();
  init_extract2();
  init_function2();
  init_indexed2();
  init_instance_type2();
  init_instantiate2();
  init_integer2();
  init_intersect2();
  init_intrinsic2();
  init_iterator2();
  init_keyof2();
  init_literal2();
  init_mapped2();
  init_module2();
  init_never2();
  init_not2();
  init_null2();
  init_number2();
  init_object2();
  init_omit2();
  init_optional2();
  init_parameters2();
  init_partial2();
  init_pick2();
  init_promise2();
  init_readonly2();
  init_readonly_optional2();
  init_record2();
  init_recursive2();
  init_ref2();
  init_regexp2();
  init_required2();
  init_rest2();
  init_return_type2();
  init_string2();
  init_symbol2();
  init_template_literal2();
  init_transform2();
  init_tuple2();
  init_uint8array2();
  init_undefined2();
  init_union2();
  init_unknown2();
  init_unsafe2();
  init_void2();
});

// node_modules/@sinclair/typebox/build/esm/type/type/index.mjs
var Type;
var init_type6 = __esm(() => {
  init_type5();
  Type = exports_type3;
});

// node_modules/@sinclair/typebox/build/esm/index.mjs
var init_esm = __esm(() => {
  init_clone();
  init_create();
  init_error2();
  init_guard2();
  init_helpers();
  init_patterns2();
  init_registry();
  init_sets();
  init_symbols2();
  init_any2();
  init_array2();
  init_argument2();
  init_async_iterator2();
  init_awaited2();
  init_bigint2();
  init_boolean2();
  init_composite2();
  init_const2();
  init_constructor2();
  init_constructor_parameters2();
  init_date2();
  init_enum2();
  init_exclude2();
  init_extends2();
  init_extract2();
  init_function2();
  init_indexed2();
  init_instance_type2();
  init_instantiate2();
  init_integer2();
  init_intersect2();
  init_iterator2();
  init_intrinsic2();
  init_keyof2();
  init_literal2();
  init_module2();
  init_mapped2();
  init_never2();
  init_not2();
  init_null2();
  init_number2();
  init_object2();
  init_omit2();
  init_optional2();
  init_parameters2();
  init_partial2();
  init_pick2();
  init_promise2();
  init_readonly2();
  init_readonly_optional2();
  init_record2();
  init_recursive2();
  init_ref2();
  init_regexp2();
  init_required2();
  init_rest2();
  init_return_type2();
  init_schema2();
  init_static2();
  init_string2();
  init_symbol2();
  init_template_literal2();
  init_transform2();
  init_tuple2();
  init_uint8array2();
  init_undefined2();
  init_union2();
  init_unknown2();
  init_unsafe2();
  init_void2();
  init_type6();
});

// src/abortable.ts
function abortable(promise3, signal) {
  if (!signal)
    return promise3;
  if (signal.aborted)
    return Promise.reject(signal.reason);
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => signal.removeEventListener("abort", onAbort);
    const onAbort = () => {
      if (settled)
        return;
      settled = true;
      cleanup();
      reject(signal.reason);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise3.then((value2) => {
      if (settled)
        return;
      settled = true;
      cleanup();
      resolve(value2);
    }, (error3) => {
      if (settled)
        return;
      settled = true;
      cleanup();
      reject(error3);
    });
  });
}

// src/default-agents.ts
var READ_ONLY_TOOLS, DEFAULT_AGENTS;
var init_default_agents = __esm(() => {
  READ_ONLY_TOOLS = ["read", "bash", "grep", "find", "ls"];
  DEFAULT_AGENTS = new Map([
    [
      "general-purpose",
      {
        name: "general-purpose",
        displayName: "Agent",
        description: "General-purpose agent for researching complex questions, searching for code, and executing multi-step tasks. When you are searching for a keyword or file and are not confident that you will find the right match in the first few tries use this agent to perform the search for you.",
        extensions: true,
        skills: true,
        systemPrompt: "",
        promptMode: "append",
        isDefault: true
      }
    ],
    [
      "Explore",
      {
        name: "Explore",
        displayName: "Explore",
        description: 'Fast read-only search agent for locating code. Use it to find files by pattern (eg. "src/components/**/*.tsx"), grep for symbols or keywords (eg. "API endpoints"), or answer "where is X defined / which files reference Y." Do NOT use it for code review, design-doc auditing, cross-file consistency checks, or open-ended analysis — it reads excerpts rather than whole files and will miss content past its read window. When calling, specify search breadth: "quick" for a single targeted lookup, "medium" for moderate exploration, or "very thorough" to search across multiple locations and naming conventions.',
        builtinToolNames: READ_ONLY_TOOLS,
        extensions: true,
        skills: true,
        systemPrompt: `# CRITICAL: READ-ONLY MODE - NO FILE MODIFICATIONS
You are a file search specialist. You excel at thoroughly navigating and exploring codebases.
Your role is EXCLUSIVELY to search and analyze existing code. You do NOT have access to file editing tools.

You are STRICTLY PROHIBITED from:
- Creating new files
- Modifying existing files
- Deleting files
- Moving or copying files
- Creating temporary files anywhere, including /tmp
- Using redirect operators (>, >>, |) or heredocs to write to files
- Running ANY commands that change system state

Use Bash ONLY for read-only operations: ls, git status, git log, git diff, find, cat, head, tail.

# Tool Usage
- Use the find tool for file pattern matching (NOT the bash find command)
- Use the grep tool for content search (NOT bash grep/rg command)
- Use the read tool for reading files (NOT bash cat/head/tail)
- Use Bash ONLY for read-only operations
- Make independent tool calls in parallel for efficiency
- Adapt search approach based on thoroughness level specified

# Output
- Use absolute file paths in all references
- Report findings as regular messages
- Do not use emojis
- Be thorough and precise`,
        promptMode: "replace",
        isDefault: true
      }
    ],
    [
      "Plan",
      {
        name: "Plan",
        displayName: "Plan",
        description: "Software architect agent for designing implementation plans. Use this when you need to plan the implementation strategy for a task. Returns step-by-step plans, identifies critical files, and considers architectural trade-offs.",
        builtinToolNames: READ_ONLY_TOOLS,
        extensions: true,
        skills: true,
        systemPrompt: `# CRITICAL: READ-ONLY MODE - NO FILE MODIFICATIONS
You are a software architect and planning specialist.
Your role is EXCLUSIVELY to explore the codebase and design implementation plans.
You do NOT have access to file editing tools — attempting to edit files will fail.

You are STRICTLY PROHIBITED from:
- Creating new files
- Modifying existing files
- Deleting files
- Moving or copying files
- Creating temporary files anywhere, including /tmp
- Using redirect operators (>, >>, |) or heredocs to write to files
- Running ANY commands that change system state

# Planning Process
1. Understand requirements
2. Explore thoroughly (read files, find patterns, understand architecture)
3. Design solution based on your assigned perspective
4. Detail the plan with step-by-step implementation strategy

# Requirements
- Consider trade-offs and architectural decisions
- Identify dependencies and sequencing
- Anticipate potential challenges
- Follow existing patterns where appropriate

# Tool Usage
- Use the find tool for file pattern matching (NOT the bash find command)
- Use the grep tool for content search (NOT bash grep/rg command)
- Use the read tool for reading files (NOT bash cat/head/tail)
- Use Bash ONLY for read-only operations

# Output Format
- Use absolute file paths
- Do not use emojis
- End your response with:

### Critical Files for Implementation
List 3-5 files most critical for implementing this plan:
- /absolute/path/to/file.ts - [Brief reason]`,
        promptMode: "replace",
        isDefault: true
      }
    ]
  ]);
});

// src/agent-types.ts
import { createCodingTools, createReadOnlyTools } from "@earendil-works/pi-coding-agent";
function isDefaultsDisabled() {
  return disableDefaults;
}
function setDefaultsDisabled(b) {
  disableDefaults = b;
}
function setAgentOverrides(overrides) {
  agentOverrides = new Map(Object.entries(overrides).map(([name, override]) => [name.toLowerCase(), override]));
}
function getFallbackSubagent() {
  return fallbackSubagent;
}
function setFallbackSubagent(v) {
  fallbackSubagent = v;
}
function buildAgentRegistry(userAgents) {
  const registry2 = new Map;
  if (!disableDefaults) {
    for (const [name, config] of DEFAULT_AGENTS)
      registry2.set(name, config);
  }
  for (const [name, config] of userAgents)
    registry2.set(name, config);
  return new Map([...registry2.entries()].map(([name, config]) => {
    const override = agentOverrides.get(name.toLowerCase());
    return [name, override?.model ? { ...config, model: override.model } : config];
  }));
}
function registerAgents(userAgents) {
  agents.clear();
  for (const [name, config] of buildAgentRegistry(userAgents)) {
    agents.set(name, config);
  }
}
function resolveKeyIn(registry2, name) {
  if (registry2.has(name))
    return name;
  const lower = name.toLowerCase();
  for (const key of registry2.keys()) {
    if (key.toLowerCase() === lower)
      return key;
  }
  return;
}
function resolveKey(name) {
  return resolveKeyIn(agents, name);
}
function resolveTypeIn(registry2, name) {
  return resolveKeyIn(registry2, name);
}
function getAgentConfigIn(registry2, name) {
  const key = resolveKeyIn(registry2, name);
  return key ? registry2.get(key) : undefined;
}
function getAvailableTypesIn(registry2) {
  return [...registry2.entries()].filter(([_, config]) => config.enabled !== false).map(([name]) => name);
}
function resolveUnambiguousKeyIn(registry2, name) {
  if (registry2.has(name))
    return name;
  const lower = name.toLowerCase();
  const matches = [...registry2.keys()].filter((key) => key.toLowerCase() === lower);
  return matches.length === 1 ? matches[0] : undefined;
}
function resolveEnabledTypeIn(registry2, requested) {
  const raw = typeof requested === "string" ? requested.trim() : "";
  if (!raw)
    return;
  const key = resolveUnambiguousKeyIn(registry2, raw);
  return key !== undefined && registry2.get(key)?.enabled !== false ? key : undefined;
}
function resolveSpawnTypeIn(registry2, requested) {
  const raw = typeof requested === "string" ? requested.trim() : "";
  const available = () => getAvailableTypesIn(registry2).join(", ") || "(none)";
  const key = resolveEnabledTypeIn(registry2, raw);
  if (key !== undefined)
    return { ok: true, type: key };
  const reason = raw ? `Unknown or disabled agent type: "${raw}".` : "No agent type given.";
  const configured = typeof fallbackSubagent === "string" ? fallbackSubagent.trim() : undefined;
  if (configured !== undefined && configured.toLowerCase() === NO_FALLBACK) {
    return { ok: false, message: `${reason} Available: ${available()}.` };
  }
  if (configured !== undefined) {
    const fallbackKey = resolveUnambiguousKeyIn(registry2, configured);
    if (fallbackKey === undefined || registry2.get(fallbackKey)?.enabled === false) {
      return {
        ok: false,
        message: `${reason} The configured fallbackSubagent "${configured}" is itself ` + `unknown or disabled. Available: ${available()}.`
      };
    }
    return { ok: true, type: fallbackKey, fellBackFrom: raw };
  }
  return { ok: true, type: "general-purpose", fellBackFrom: raw };
}
function resolveSpawnType(requested) {
  return resolveSpawnTypeIn(agents, requested);
}
function resolveType(name) {
  return resolveKey(name);
}
function getAgentConfig(name) {
  return getAgentConfigIn(agents, name);
}
function getAvailableTypes() {
  return getAvailableTypesIn(agents);
}
function getAllTypes() {
  return [...agents.keys()];
}
function getMemoryToolNames(existingToolNames) {
  return MEMORY_TOOL_NAMES.filter((n) => !existingToolNames.has(n));
}
function getReadOnlyMemoryToolNames(existingToolNames) {
  return READONLY_MEMORY_TOOL_NAMES.filter((n) => !existingToolNames.has(n));
}
function getToolNamesForType(type4) {
  const key = resolveKey(type4);
  const raw = key ? agents.get(key) : undefined;
  const config = raw?.enabled !== false ? raw : undefined;
  return config?.builtinToolNames ?? [...BUILTIN_TOOL_NAMES];
}
function getConfig(type4) {
  const key = resolveKey(type4);
  const config = key ? agents.get(key) : undefined;
  if (config && config.enabled !== false) {
    return {
      displayName: config.displayName ?? config.name,
      color: config.color,
      description: config.description,
      builtinToolNames: config.builtinToolNames ?? BUILTIN_TOOL_NAMES,
      extensions: config.extensions,
      excludeExtensions: config.excludeExtensions,
      skills: config.skills,
      promptMode: config.promptMode
    };
  }
  const gp = agents.get("general-purpose");
  if (gp && gp.enabled !== false) {
    return {
      displayName: gp.displayName ?? gp.name,
      color: gp.color,
      description: gp.description,
      builtinToolNames: gp.builtinToolNames ?? BUILTIN_TOOL_NAMES,
      extensions: gp.extensions,
      excludeExtensions: gp.excludeExtensions,
      skills: gp.skills,
      promptMode: gp.promptMode
    };
  }
  return {
    displayName: "Agent",
    description: "General-purpose agent for complex, multi-step tasks",
    builtinToolNames: BUILTIN_TOOL_NAMES,
    extensions: true,
    skills: true,
    promptMode: "append"
  };
}
var BUILTIN_TOOL_NAMES, agents, disableDefaults = false, agentOverrides, NO_FALLBACK = "none", fallbackSubagent, MEMORY_TOOL_NAMES, READONLY_MEMORY_TOOL_NAMES;
var init_agent_types = __esm(() => {
  init_default_agents();
  BUILTIN_TOOL_NAMES = [
    ...new Set([...createCodingTools("."), ...createReadOnlyTools(".")].map((t) => t.name))
  ];
  agents = new Map;
  agentOverrides = new Map;
  MEMORY_TOOL_NAMES = ["read", "write", "edit"];
  READONLY_MEMORY_TOOL_NAMES = ["read"];
});

// src/agent-color.ts
function resolveAgentColor(value2) {
  if (!value2)
    return;
  const normalized = value2.trim().toLowerCase();
  const resolved = NAMED_AGENT_COLORS[normalized] ?? normalized;
  return /^#[0-9a-f]{6}$/i.test(resolved) ? resolved.toUpperCase() : undefined;
}
function parseHex(hex) {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16)
  };
}
function nearest(values, value2) {
  return values.reduce((best, v, i) => Math.abs(value2 - v) < Math.abs(value2 - values[best]) ? i : best, 0);
}
function rgbTo256({ r, g, b }) {
  const [rIndex, gIndex, bIndex] = [r, g, b].map((channel) => nearest(CUBE_VALUES, channel));
  const distance = ({ r: cr, g: cg, b: cb }) => 0.299 * (r - cr) ** 2 + 0.587 * (g - cg) ** 2 + 0.114 * (b - cb) ** 2;
  const grayIndex = nearest(GRAY_VALUES, Math.round(0.299 * r + 0.587 * g + 0.114 * b));
  const gray = { r: GRAY_VALUES[grayIndex], g: GRAY_VALUES[grayIndex], b: GRAY_VALUES[grayIndex] };
  const cube = { r: CUBE_VALUES[rIndex], g: CUBE_VALUES[gIndex], b: CUBE_VALUES[bIndex] };
  if (Math.max(r, g, b) - Math.min(r, g, b) < 10 && distance(gray) < distance(cube)) {
    return { index: 232 + grayIndex, rgb: gray };
  }
  return { index: 16 + 36 * rIndex + 6 * gIndex + bIndex, rgb: cube };
}
function ansiColor(layer, color) {
  const code = layer === "foreground" ? 38 : 48;
  return typeof color === "number" ? `\x1B[${code};5;${color}m` : `\x1B[${code};2;${color.r};${color.g};${color.b}m`;
}
function relativeLuminance({ r, g, b }) {
  const linear = (value2) => {
    const channel = value2 / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}
function renderAgentNameLabel(name, color, theme, style = {}) {
  const resolved = resolveAgentColor(color);
  if (!resolved) {
    const text = style.bold ? theme.bold(name) : name;
    return style.fallbackColor ? theme.fg(style.fallbackColor, text) : text;
  }
  const rgb = parseHex(resolved);
  const quantized = (theme.getColorMode?.() ?? "truecolor") === "256color" ? rgbTo256(rgb) : undefined;
  const shown = quantized?.rgb ?? rgb;
  const contrasting = relativeLuminance(shown) > 0.179 ? BLACK : WHITE;
  const label = style.bold ? theme.bold(` ${name} `) : ` ${name} `;
  return ansiColor("background", quantized?.index ?? rgb) + ansiColor("foreground", quantized ? rgbTo256(contrasting).index : contrasting) + label + "\x1B[39m" + (style.restoreBackground ?? "\x1B[49m");
}
function hasAgentBadge(type4) {
  return type4 !== undefined && resolveAgentColor(getConfig(type4).color) !== undefined;
}
function renderAgentName(type4, theme, style = {}) {
  if (!type4)
    return renderAgentNameLabel("Agent", undefined, theme, style);
  const config = getConfig(type4);
  return renderAgentNameLabel(config.displayName, config.color, theme, style);
}
var NAMED_AGENT_COLORS, CUBE_VALUES, GRAY_VALUES, BLACK, WHITE;
var init_agent_color = __esm(() => {
  init_agent_types();
  NAMED_AGENT_COLORS = {
    red: "#DC2626",
    blue: "#6A9BCC",
    green: "#16A34A",
    yellow: "#CA8A04",
    purple: "#827DBD",
    orange: "#D97757",
    pink: "#C46686",
    cyan: "#0891B2",
    amber: "#F59E0B",
    teal: "#008080",
    indigo: "#6366F1",
    gold: "#EAB308",
    "neon-green": "#10B981",
    "neon-cyan": "#06B6D4",
    "metallic-blue": "#3B82F6",
    violet: "#8B5CF6",
    rose: "#F43F5E",
    lime: "#84CC16",
    gray: "#6B7280",
    grey: "#6B7280",
    fuchsia: "#D946EF",
    slate: "#64748B",
    navy: "#1E3A8A"
  };
  CUBE_VALUES = [0, 95, 135, 175, 215, 255];
  GRAY_VALUES = Array.from({ length: 24 }, (_, i) => 8 + i * 10);
  BLACK = { r: 0, g: 0, b: 0 };
  WHITE = { r: 255, g: 255, b: 255 };
});

// src/custom-agents.ts
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { getAgentDir, parseFrontmatter } from "@earendil-works/pi-coding-agent";
function loadCustomAgents(cwd, strict = false) {
  const globalDir = join(getAgentDir(), "agents");
  const workspaceProjectDir = join(cwd, ".agents", "agents");
  const projectDir = join(cwd, ".pi", "agents");
  const agents2 = new Map;
  loadFromDir(globalDir, agents2, "global", strict);
  loadFromDir(workspaceProjectDir, agents2, "project", strict);
  loadFromDir(projectDir, agents2, "project", strict);
  warnedLastLoad = warnedThisLoad;
  warnedThisLoad = new Set;
  return agents2;
}
function loadFromDir(dir, agents2, source, strict) {
  if (!existsSync(dir))
    return;
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  } catch {
    return;
  }
  for (const file of files) {
    const filenameType = basename(file, ".md");
    const path = join(dir, file);
    const parsed = readAgentFile(path, strict);
    if (!parsed) {
      warnSkippedOverride(filenameType, agents2);
      continue;
    }
    const { frontmatter: fm, body } = parsed;
    const declared = str(fm.name)?.trim();
    if (declared?.includes(RESERVED_IN_TYPE)) {
      warnIfNew(`Agent file ${path} declares name "${declared}", which contains "${RESERVED_IN_TYPE}" — reserved for ` + "plugin-scoped identifiers. Rename it, or move the label to `display_name:`. Skipping.");
      continue;
    }
    const name = declared || filenameType;
    const { builtinToolNames, extSelectors } = parseToolsField(fm.tools);
    agents2.set(name, {
      name,
      displayName: str(fm.display_name),
      color: str(fm.color),
      description: str(fm.description) ?? name,
      builtinToolNames,
      extSelectors,
      disallowedTools: csvListOptional(fm.disallowed_tools),
      extensions: inheritField(fm.extensions ?? fm.inherit_extensions),
      excludeExtensions: csvListOptional(fm.exclude_extensions),
      skills: inheritField(fm.skills ?? fm.inherit_skills),
      model: str(fm.model),
      thinking: str(fm.thinking),
      maxTurns: nonNegativeInt(fm.max_turns),
      persistSession: fm.persist_session != null ? fm.persist_session === true : undefined,
      outputTranscript: fm.output_transcript != null ? fm.output_transcript !== false : undefined,
      sessionDir: str(fm.session_dir),
      allowedSubagents: parseAllowedSubagents(fm.allowed_subagents),
      systemPrompt: body.trim(),
      promptMode: fm.prompt_mode === "append" ? "append" : "replace",
      inheritContext: fm.inherit_context != null ? fm.inherit_context === true : undefined,
      runInBackground: fm.run_in_background != null ? fm.run_in_background === true : undefined,
      isolated: fm.isolated != null ? fm.isolated === true : undefined,
      memory: parseMemory(fm.memory),
      isolation: parseIsolation(fm.isolation),
      enabled: fm.enabled !== false,
      source,
      sourcePath: path
    });
  }
}
function parseAgentFrontmatter(content) {
  return parseFrontmatter(content.startsWith("\uFEFF") ? content.slice(1) : content);
}
function readAgentFile(path, strict) {
  try {
    return parseAgentFrontmatter(readFileSync(path, "utf-8"));
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    if (strict)
      throw new Error(`${path}: ${reason}`);
    warnIfNew(`Skipping agent file ${path}: ${reason}`);
    return;
  }
}
function warnSkippedOverride(name, agents2) {
  const surviving = agents2.get(name);
  if (!surviving?.sourcePath || surviving.enabled === false)
    return;
  warnIfNew(`Agent "${name}" now loads from ${surviving.sourcePath} instead`);
}
function warnIfNew(message) {
  warnedThisLoad.add(message);
  if (warnedLastLoad.has(message))
    return;
  console.warn(`[pi-subagents] ${message}`);
}
function str(val) {
  return typeof val === "string" ? val : undefined;
}
function nonNegativeInt(val) {
  return typeof val === "number" && val >= 0 ? val : undefined;
}
function parseCsvField(val) {
  if (val === undefined || val === null)
    return;
  const s = String(val).trim();
  if (!s || s === "none")
    return;
  const items = s.split(",").map((t) => t.trim()).filter(Boolean);
  return items.length > 0 ? items : undefined;
}
function parseAllowedSubagents(val) {
  if (typeof val === "boolean")
    return val ? "all" : undefined;
  const items = parseCsvField(val);
  if (!items)
    return;
  return items.some((i) => i === "*" || i.toLowerCase() === "all") ? "all" : items;
}
function csvList(val, defaults) {
  if (val === undefined || val === null)
    return defaults;
  return parseCsvField(val) ?? [];
}
function parseToolsField(val) {
  const entries = csvList(val, BUILTIN_TOOL_NAMES);
  const isWildcard = (e) => e === "*" || e.toLowerCase() === "all";
  const hasWildcard = entries.some(isWildcard);
  const plain = entries.filter((e) => !isWildcard(e) && !e.startsWith("ext:"));
  const extEntries = entries.filter((e) => e.startsWith("ext:"));
  return {
    builtinToolNames: hasWildcard ? [...new Set([...BUILTIN_TOOL_NAMES, ...plain])] : plain,
    extSelectors: extEntries.length > 0 ? extEntries : undefined
  };
}
function csvListOptional(val) {
  return parseCsvField(val);
}
function parseMemory(val) {
  if (val === "user" || val === "project" || val === "local")
    return val;
  return;
}
function parseIsolation(val) {
  if (val === "worktree")
    return "worktree";
  if (val === "off" || val === "none" || val === "no" || val === false)
    return "off";
  return;
}
function inheritField(val) {
  if (val === undefined || val === null || val === true)
    return true;
  if (val === false || val === "none")
    return false;
  const items = csvList(val, []);
  return items.length > 0 ? items : false;
}
var RESERVED_IN_TYPE = ":", warnedLastLoad, warnedThisLoad;
var init_custom_agents = __esm(() => {
  init_agent_types();
  warnedLastLoad = new Set;
  warnedThisLoad = new Set;
});

// src/child-context.ts
import { AsyncLocalStorage } from "node:async_hooks";
function inChildSessionContext() {
  return childSessionContext.getStore() === true;
}
function runInChildSessionContext(fn) {
  return childSessionContext.run(true, fn);
}
var childSessionContext;
var init_child_context = __esm(() => {
  childSessionContext = new AsyncLocalStorage;
});

// src/context.ts
function extractText(content) {
  return content.filter((c) => c.type === "text").map((c) => c.text ?? "").join(`
`);
}
function buildParentContext(ctx) {
  const entries = ctx.sessionManager.getBranch();
  if (!entries || entries.length === 0)
    return "";
  const parts = [];
  for (const entry of entries) {
    if (entry.type === "message") {
      const msg = entry.message;
      if (msg.role === "user") {
        const text = typeof msg.content === "string" ? msg.content : extractText(msg.content);
        if (text.trim())
          parts.push(`[User]: ${text.trim()}`);
      } else if (msg.role === "assistant") {
        const text = extractText(msg.content);
        if (text.trim())
          parts.push(`[Assistant]: ${text.trim()}`);
      }
    } else if (entry.type === "compaction") {
      if (entry.summary) {
        parts.push(`[Summary]: ${entry.summary}`);
      }
    }
  }
  if (parts.length === 0)
    return "";
  return `# Parent Conversation Context
The following is the conversation history from the parent session that spawned you.
Use this context to understand what has been discussed and decided so far.

${parts.join(`

`)}

---
# Your Task (below)
`;
}

// src/env.ts
async function detectEnv(pi, cwd) {
  let isGitRepo = false;
  let branch = "";
  try {
    const result = await pi.exec("git", ["rev-parse", "--is-inside-work-tree"], { cwd, timeout: 5000 });
    isGitRepo = result.code === 0 && result.stdout.trim() === "true";
  } catch {}
  if (isGitRepo) {
    try {
      const result = await pi.exec("git", ["branch", "--show-current"], { cwd, timeout: 5000 });
      branch = result.code === 0 ? result.stdout.trim() : "unknown";
    } catch {
      branch = "unknown";
    }
  }
  return {
    isGitRepo,
    branch,
    platform: process.platform
  };
}

// src/memory.ts
import { existsSync as existsSync3, lstatSync, mkdirSync, readFileSync as readFileSync2 } from "node:fs";
import { homedir } from "node:os";
import { join as join3 } from "node:path";
import { getAgentDir as getAgentDir3 } from "@earendil-works/pi-coding-agent";
function isUnsafeName(name) {
  if (!name || name.length > 128)
    return true;
  return !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name);
}
function isSymlink(filePath) {
  try {
    return lstatSync(filePath).isSymbolicLink();
  } catch {
    return false;
  }
}
function safeReadFile(filePath) {
  if (!existsSync3(filePath))
    return;
  if (isSymlink(filePath))
    return;
  try {
    return readFileSync2(filePath, "utf-8");
  } catch {
    return;
  }
}
function resolveMemoryDir(agentName, scope, cwd) {
  if (isUnsafeName(agentName)) {
    throw new Error(`Unsafe agent name for memory directory: "${agentName}"`);
  }
  switch (scope) {
    case "user": {
      const current = join3(getAgentDir3(), "agent-memory", agentName);
      const legacy = join3(homedir(), ".pi", "agent-memory", agentName);
      if (!existsSync3(current) && existsSync3(legacy) && !isSymlink(legacy)) {
        return legacy;
      }
      return current;
    }
    case "project":
      return join3(cwd, ".pi", "agent-memory", agentName);
    case "local":
      return join3(cwd, ".pi", "agent-memory-local", agentName);
  }
}
function ensureMemoryDir(memoryDir) {
  if (existsSync3(memoryDir)) {
    if (isSymlink(memoryDir)) {
      throw new Error(`Refusing to use symlinked memory directory: ${memoryDir}`);
    }
    return;
  }
  mkdirSync(memoryDir, { recursive: true });
}
function readMemoryIndex(memoryDir) {
  if (isSymlink(memoryDir))
    return;
  const memoryFile = join3(memoryDir, "MEMORY.md");
  const content = safeReadFile(memoryFile);
  if (content === undefined)
    return;
  const lines = content.split(`
`);
  if (lines.length > MAX_MEMORY_LINES) {
    return lines.slice(0, MAX_MEMORY_LINES).join(`
`) + `
... (truncated at 200 lines)`;
  }
  return content;
}
function buildMemoryBlock(agentName, scope, cwd) {
  const memoryDir = resolveMemoryDir(agentName, scope, cwd);
  ensureMemoryDir(memoryDir);
  const existingMemory = readMemoryIndex(memoryDir);
  const header = `# Agent Memory

You have a persistent memory directory at: ${memoryDir}/
Memory scope: ${scope}

This memory persists across sessions. Use it to build up knowledge over time.`;
  const memoryContent = existingMemory ? `

## Current MEMORY.md
${existingMemory}` : `

No MEMORY.md exists yet. Create one at ${join3(memoryDir, "MEMORY.md")} to start building persistent memory.`;
  const instructions = `

## Memory Instructions
- MEMORY.md is an index file — keep it concise (under 200 lines). Lines after 200 are truncated.
- Store detailed memories in separate files within ${memoryDir}/ and link to them from MEMORY.md.
- Each memory file should use this frontmatter format:
  \`\`\`markdown
  ---
  name: <memory name>
  description: <one-line description>
  type: <user|feedback|project|reference>
  ---
  <memory content>
  \`\`\`
- Update or remove memories that become outdated. Check for existing memories before creating duplicates.
- You have Read, Write, and Edit tools available for managing memory files.`;
  return header + memoryContent + instructions;
}
function buildReadOnlyMemoryBlock(agentName, scope, cwd) {
  const memoryDir = resolveMemoryDir(agentName, scope, cwd);
  const existingMemory = readMemoryIndex(memoryDir);
  const header = `# Agent Memory (read-only)

Memory scope: ${scope}
You have read-only access to memory. You can reference existing memories but cannot create or modify them.`;
  const memoryContent = existingMemory ? `

## Current MEMORY.md
${existingMemory}` : `

No memory is available yet. Other agents or sessions with write access can create memories for you to consume.`;
  return header + memoryContent;
}
var MAX_MEMORY_LINES = 200;
var init_memory = () => {};

// src/invocation-config.ts
function isolationParam(enabled) {
  return enabled ? isolationParamShape : {};
}
function resolveAgentInvocationConfig(agentConfig, params, opts) {
  const requested = agentConfig?.isolation ?? params.isolation;
  const isolation = requested === "worktree" && opts?.worktreeAllowed !== false ? "worktree" : undefined;
  const overriddenThinking = agentConfig?.thinking != null && params.thinking != null && agentConfig.thinking !== params.thinking ? params.thinking : undefined;
  const overriddenModel = agentConfig?.model != null && params.model != null && agentConfig.model !== params.model ? params.model : undefined;
  return {
    modelInput: agentConfig?.model ?? params.model,
    modelFromParams: agentConfig?.model == null && params.model != null,
    thinking: agentConfig?.thinking ?? params.thinking,
    maxTurns: agentConfig?.maxTurns ?? params.max_turns,
    inheritContext: agentConfig?.inheritContext ?? params.inherit_context ?? false,
    runInBackground: agentConfig?.runInBackground ?? params.run_in_background ?? opts?.defaultRunInBackground ?? false,
    isolated: agentConfig?.isolated ?? params.isolated ?? false,
    isolation,
    overridden: overriddenThinking || overriddenModel ? { thinking: overriddenThinking, model: overriddenModel } : undefined
  };
}
function resolveJoinMode(defaultJoinMode, runInBackground) {
  return runInBackground ? defaultJoinMode : undefined;
}
var isolationParamShape;
var init_invocation_config = __esm(() => {
  init_esm();
  isolationParamShape = {
    isolation: Type.Optional(Type.Union([Type.Literal("off"), Type.Literal("worktree")], {
      description: 'Isolation mode. Default "off". "off" runs the agent in the current checkout, the same as omitting the field. "worktree" creates a temporary git worktree so the agent works on an isolated copy of the repo (a copy cannot see uncommitted or staged changes in the main checkout).'
    }))
  };
});

// src/model-resolver.ts
function describeModel(model) {
  return {
    modelName: (model.name ?? model.id).replace(/^Claude\s+/i, "").toLowerCase(),
    modelId: `${model.provider}/${model.id}`
  };
}
function resolveModel(input, registry2) {
  const all = registry2.getAvailable?.() ?? registry2.getAll();
  const availableSet = new Set(all.map((m) => `${m.provider}/${m.id}`.toLowerCase()));
  const slashIdx = input.indexOf("/");
  if (slashIdx !== -1) {
    const provider = input.slice(0, slashIdx);
    const modelId = input.slice(slashIdx + 1);
    if (availableSet.has(input.toLowerCase())) {
      const found = registry2.find(provider, modelId);
      if (found)
        return found;
    }
  }
  const normalize = (s) => s.toLowerCase().replace(/\./g, "-");
  const query = normalize(input);
  let bestMatch;
  let bestScore = 0;
  for (const m of all) {
    const id = normalize(m.id);
    const name = normalize(m.name);
    const full = normalize(`${m.provider}/${m.id}`);
    let score = 0;
    if (id === query || full === query) {
      score = 100;
    } else if (id.includes(query) || full.includes(query)) {
      score = 60 + query.length / id.length * 30;
    } else if (name.includes(query)) {
      score = 40 + query.length / name.length * 20;
    } else if (query.split(/[\s\-/]+/).every((part) => /^\d{8}$/.test(part) || id.includes(part) || name.includes(part) || m.provider.toLowerCase().includes(part))) {
      score = 20;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = m;
    }
  }
  if (bestMatch && bestScore >= 20) {
    const found = registry2.find(bestMatch.provider, bestMatch.id);
    if (found)
      return found;
  }
  if (slashIdx !== -1) {
    const bare = resolveModel(input.slice(slashIdx + 1), registry2);
    if (typeof bare !== "string")
      return bare;
  }
  const modelList = all.map((m) => `  ${m.provider}/${m.id}`).sort().join(`
`);
  return `Model not found: "${input}".

Available models:
${modelList}`;
}

// src/enabled-models.ts
import { existsSync as existsSync4, readFileSync as readFileSync3, statSync } from "node:fs";
import { join as join4 } from "node:path";
import { getAgentDir as getAgentDir4 } from "@earendil-works/pi-coding-agent";
function settingsPaths(cwd) {
  return [
    join4(cwd, ".pi", "settings.json"),
    join4(getAgentDir4(), "settings.json")
  ];
}
function readField(path) {
  if (!existsSync4(path))
    return;
  try {
    const raw = JSON.parse(readFileSync3(path, "utf-8"));
    if (Array.isArray(raw?.enabledModels))
      return raw.enabledModels;
  } catch {}
  return;
}
function readEnabledModels(cwd) {
  const [project, global] = settingsPaths(cwd);
  return readField(project) ?? readField(global);
}
function hashOf(path) {
  try {
    const s = statSync(path);
    return `${s.mtimeMs}-${s.size}`;
  } catch {
    return "missing";
  }
}
function resolveEnabledModels(patterns3, registry2, cwd = process.cwd()) {
  const patternsKey = JSON.stringify(patterns3);
  const [project, global] = settingsPaths(cwd);
  const fileHash = `${hashOf(project)};${hashOf(global)}`;
  if (fileHash === cachedHash && patternsKey === cachedPatternsKey) {
    return cachedAllowed;
  }
  if (!patterns3 || patterns3.length === 0) {
    cachedHash = fileHash;
    cachedPatternsKey = patternsKey;
    cachedAllowed = undefined;
    return;
  }
  const available = registry2.getAvailable?.() ?? registry2.getAll();
  const allowed = new Set;
  for (const pattern2 of patterns3) {
    const trimmed = pattern2.trim();
    if (!trimmed)
      continue;
    resolveExact(trimmed, available, allowed);
  }
  const result = allowed.size > 0 ? allowed : undefined;
  cachedHash = fileHash;
  cachedPatternsKey = patternsKey;
  cachedAllowed = result;
  return result;
}
function isModelInScope(model, allowed) {
  return allowed.has(modelKey(model));
}
function modelKey(model) {
  return `${model.provider}/${model.id}`.toLowerCase();
}
function resolveExact(pattern2, available, allowed) {
  const slashIdx = pattern2.indexOf("/");
  if (slashIdx === -1)
    return;
  const provider = pattern2.slice(0, slashIdx).toLowerCase();
  const modelId = pattern2.slice(slashIdx + 1).toLowerCase();
  const exact = available.find((m) => m.provider.toLowerCase() === provider && m.id.toLowerCase() === modelId);
  if (exact) {
    allowed.add(modelKey(exact));
  }
}
var cachedAllowed, cachedHash = "", cachedPatternsKey = "";
var init_enabled_models = () => {};

// src/model-scope.ts
function isScopeModelsEnabled() {
  return scopeModelsEnabled;
}
function setScopeModelsEnabled(enabled) {
  scopeModelsEnabled = enabled;
}
function checkModelScope(args) {
  const { model, cwd, modelRegistry, callerSupplied, agentLabel, modelInput } = args;
  if (!scopeModelsEnabled || !model)
    return { kind: "ok" };
  const allowed = resolveEnabledModels(readEnabledModels(cwd), modelRegistry, cwd);
  if (!allowed || isModelInScope(model, allowed))
    return { kind: "ok" };
  if (callerSupplied) {
    const list = [...allowed].sort().map((m) => `  ${m}`).join(`
`);
    return {
      kind: "error",
      message: `Model not in scope: "${modelInput}".

Allowed models (from enabledModels):
${list}`
    };
  }
  const modelLabel = modelInput ?? `${model.provider}/${model.id}`;
  return {
    kind: "warn",
    message: `Agent "${agentLabel}" using out-of-scope model "${modelLabel}"`
  };
}
var scopeModelsEnabled = false;
var init_model_scope = __esm(() => {
  init_enabled_models();
});

// src/output-file.ts
import { appendFileSync, chmodSync, mkdirSync as mkdirSync2, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join as join5 } from "node:path";
function getOutputTranscriptDefault() {
  return outputTranscriptDefault;
}
function setOutputTranscriptDefault(b) {
  outputTranscriptDefault = b;
}
function encodeCwd(cwd) {
  return cwd.replace(/[/\\]/g, "-").replace(/^[A-Za-z]:-/, "").replace(/^-+/, "");
}
function sessionTaskDir(cwd, sessionId) {
  const encoded = encodeCwd(cwd);
  const root = join5(tmpdir(), `pi-subagents-${process.getuid?.() ?? 0}`);
  mkdirSync2(root, { recursive: true, mode: 448 });
  try {
    chmodSync(root, 448);
  } catch (err) {
    if (process.platform !== "win32")
      throw err;
  }
  const dir = join5(root, encoded, sessionId, "tasks");
  mkdirSync2(dir, { recursive: true });
  return dir;
}
function createOutputFilePath(cwd, agentId, sessionId) {
  return join5(sessionTaskDir(cwd, sessionId), `${agentId}.output`);
}
function ensureOutputFile(path) {
  try {
    appendFileSync(path, "", "utf-8");
  } catch {}
}
function writeInitialEntry(path, agentId, prompt, cwd) {
  const entry = {
    isSidechain: true,
    agentId,
    type: "user",
    message: { role: "user", content: prompt },
    timestamp: new Date().toISOString(),
    cwd
  };
  writeFileSync(path, JSON.stringify(entry) + `
`, "utf-8");
}
function streamToOutputFile(session, path, agentId, cwd, startIndex) {
  let writtenCount = startIndex ?? 1;
  const flush = () => {
    const messages = session.messages;
    while (writtenCount < messages.length) {
      const msg = messages[writtenCount];
      const entry = {
        isSidechain: true,
        agentId,
        type: msg.role === "assistant" ? "assistant" : msg.role === "user" ? "user" : "toolResult",
        message: msg,
        timestamp: new Date().toISOString(),
        cwd
      };
      try {
        appendFileSync(path, JSON.stringify(entry) + `
`, "utf-8");
      } catch {}
      writtenCount++;
    }
  };
  const unsubscribe = session.subscribe((event) => {
    if (event.type === "turn_end")
      flush();
    if (event.type === "compaction_start")
      flush();
    if (event.type === "compaction_end" && !event.aborted && event.result) {
      queueMicrotask(() => {
        writtenCount = session.messages.length;
      });
    }
  });
  return () => {
    flush();
    unsubscribe();
  };
}
var outputTranscriptDefault = true;
var init_output_file = () => {};

// src/status-note.ts
function getStatusNote(status) {
  switch (status) {
    case "stopped":
      return " (STOPPED BY THE USER before completion — output is partial; the task was NOT finished)";
    case "aborted":
      return " (aborted — hit the turn limit before completion; output may be incomplete)";
    case "steered":
      return " (wrapped up at the turn limit — output may be partial)";
    default:
      return "";
  }
}
function getForegroundOutcomeNote(status) {
  switch (status) {
    case "stopped":
      return " (STOPPED BY THE USER — everything the agent produced is above; the task is unfinished)";
    case "aborted":
      return " (aborted at the turn limit — everything the agent produced is above; the task is unfinished)";
    case "steered":
      return " (wrapped up at the turn limit — everything the agent produced is above; the task may be unfinished)";
    default:
      return "";
  }
}
function partialOutputSuffix(record3) {
  const partial3 = record3.result?.trim();
  return partial3 ? `

Partial output before the failure:
${partial3}` : "";
}

// src/usage.ts
function getLifetimeTotal(u) {
  return u ? u.input + u.output + u.cacheWrite : 0;
}
function getLifetimeCost(u) {
  return u?.cost ?? 0;
}
function addUsage(into, delta) {
  into.input += delta.input;
  into.output += delta.output;
  into.cacheWrite += delta.cacheWrite;
  if (delta.cacheRead)
    into.cacheRead = (into.cacheRead ?? 0) + delta.cacheRead;
  if (delta.cost)
    into.cost = (into.cost ?? 0) + delta.cost;
}
function toReportedUsage(u) {
  const { input, output, cacheWrite, cacheRead = 0, cost = 0 } = u;
  if (input === 0 && output === 0 && cacheWrite === 0 && cacheRead === 0 && cost === 0)
    return;
  return {
    input,
    output,
    cacheRead,
    cacheWrite,
    totalTokens: input + output + cacheRead + cacheWrite,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: cost }
  };
}

class PendingUsagePool {
  pending = { input: 0, output: 0, cacheWrite: 0, cacheRead: 0, cost: 0 };
  dirty = false;
  add(delta) {
    addUsage(this.pending, delta);
    this.dirty = true;
  }
  drain() {
    if (!this.dirty)
      return;
    const drained = toReportedUsage(this.pending);
    this.pending = { input: 0, output: 0, cacheWrite: 0, cacheRead: 0, cost: 0 };
    this.dirty = false;
    return drained;
  }
}
function getSessionContextPercent(session) {
  if (!session)
    return null;
  try {
    return session.getSessionStats().contextUsage?.percent ?? null;
  } catch {
    return null;
  }
}

// src/worktree.ts
import { randomUUID } from "node:crypto";
import { existsSync as existsSync5, realpathSync } from "node:fs";
import { tmpdir as tmpdir2 } from "node:os";
import { join as join6, relative } from "node:path";
function setWorktreeIsolationEnabled(enabled) {
  worktreeIsolationEnabled = enabled;
}
function isWorktreeIsolationEnabled() {
  return worktreeIsolationEnabled;
}
async function git(pi, cwd, args, timeout) {
  const result = await pi.exec("git", args, { cwd, timeout });
  if (result.killed || result.code !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed (exit ${result.code})`);
  }
  return result.stdout.trim();
}
async function createWorktree(pi, cwd, agentId) {
  let baseSha;
  let subdir;
  try {
    await git(pi, cwd, ["rev-parse", "--is-inside-work-tree"], 5000);
    baseSha = await git(pi, cwd, ["rev-parse", "HEAD"], 5000);
    const topLevel = await git(pi, cwd, ["rev-parse", "--show-toplevel"], 5000);
    subdir = relative(realpathSync(topLevel), realpathSync(cwd));
  } catch {
    return;
  }
  const branch = `pi-agent-${agentId}`;
  const suffix = randomUUID().slice(0, 8);
  const worktreePath = join6(tmpdir2(), `pi-agent-${agentId}-${suffix}`);
  try {
    await git(pi, cwd, ["worktree", "add", "--detach", worktreePath, "HEAD"], 30000);
    return { path: worktreePath, branch, baseSha, workPath: subdir ? join6(worktreePath, subdir) : worktreePath };
  } catch {
    return;
  }
}
async function cleanupWorktree(pi, cwd, worktree, agentDescription) {
  if (!existsSync5(worktree.path)) {
    return { hasChanges: false };
  }
  try {
    const status = await git(pi, worktree.path, ["status", "--porcelain"], 1e4);
    if (status) {
      await git(pi, worktree.path, ["add", "-A"], 1e4);
      const safeDesc = agentDescription.slice(0, 200);
      const commitMsg = `pi-agent: ${safeDesc}`;
      await git(pi, worktree.path, ["commit", "--no-verify", "-m", commitMsg], 1e4);
    } else {
      const currentSha = await git(pi, worktree.path, ["rev-parse", "HEAD"], 5000);
      if (currentSha === worktree.baseSha) {
        await removeWorktree(pi, cwd, worktree.path);
        return { hasChanges: false };
      }
    }
    let branchName = worktree.branch;
    try {
      await git(pi, worktree.path, ["branch", branchName], 5000);
    } catch {
      branchName = `${worktree.branch}-${Date.now()}`;
      await git(pi, worktree.path, ["branch", branchName], 5000);
    }
    worktree.branch = branchName;
    await removeWorktree(pi, cwd, worktree.path);
    return {
      hasChanges: true,
      branch: worktree.branch,
      path: worktree.path
    };
  } catch {
    try {
      await removeWorktree(pi, cwd, worktree.path);
    } catch {}
    return { hasChanges: false };
  }
}
async function removeWorktree(pi, cwd, worktreePath) {
  try {
    await git(pi, cwd, ["worktree", "remove", "--force", worktreePath], 1e4);
  } catch {
    try {
      await git(pi, cwd, ["worktree", "prune"], 5000);
    } catch {}
  }
}
async function pruneWorktrees(pi, cwd) {
  try {
    await git(pi, cwd, ["worktree", "prune"], 5000);
  } catch {}
}
var worktreeIsolationEnabled = true;
var init_worktree = () => {};

// src/nested-tools.ts
import {
  defineTool
} from "@earendil-works/pi-coding-agent";
function getMaxSubagentDepth() {
  return maxSubagentDepth;
}
function setMaxSubagentDepth(n) {
  maxSubagentDepth = Math.max(0, Math.floor(n));
}
function textResult(text, isError = false) {
  return { content: [{ type: "text", text }], isError, details: {} };
}
function ownsRecord(record3, parentAgentId) {
  return record3?.parentAgentId === parentAgentId;
}
function formatRecord(record3, position) {
  if (record3.status === "error") {
    return `Agent failed: ${record3.error ?? "unknown error"}${partialOutputSuffix(record3)}`;
  }
  if (record3.status === "queued" || record3.status === "running") {
    return `Agent ${record3.id} is ${record3.status}.`;
  }
  const text = record3.result?.trim() || record3.error?.trim() || "No output.";
  const note = position === "inline" ? getForegroundOutcomeNote(record3.status) : getStatusNote(record3.status);
  return note ? `Nested agent${note}.

${text}` : text;
}
function createNestedSubagentTools(context) {
  const loadRegistry = () => buildAgentRegistry(loadCustomAgents(context.configCwd));
  const allowedTypesIn = (registry2) => context.allowedSubagents === "all" ? undefined : new Set(context.allowedSubagents.map((name) => resolveTypeIn(registry2, name) ?? name));
  const availableIn = (registry2) => {
    const allowed = allowedTypesIn(registry2);
    return getAvailableTypesIn(registry2).filter((name) => allowed === undefined || allowed.has(name));
  };
  const agentTool = defineTool({
    name: NESTED_TOOL_NAMES[0],
    label: "Agent",
    description: "Launch a child-safe nested subagent for bounded delegated work. " + "Only use agent types allowed by this parent agent; nesting is depth-limited.",
    parameters: Type.Object({
      prompt: Type.String({ description: "Self-contained task for the nested agent." }),
      description: Type.String({ description: "Short 3-5 word task description." }),
      subagent_type: Type.String({ description: `Allowed nested agent type. Available: ${availableIn(loadRegistry()).join(", ") || "none"}.` }),
      model: Type.Optional(Type.String({ description: "Optional provider/model override." })),
      thinking: Type.Optional(Type.String({ description: "Optional thinking level." })),
      max_turns: Type.Optional(Type.Number({ minimum: 1 })),
      run_in_background: Type.Optional(Type.Boolean({
        description: "Defaults to false for nested spawns — the call blocks and returns the child's result inline. Set true only for work you will collect later with get_subagent_result; a detached child is stopped when you finish."
      })),
      resume: Type.Optional(Type.String({ description: "Resume a nested agent owned by this parent." })),
      isolated: Type.Optional(Type.Boolean()),
      inherit_context: Type.Optional(Type.Boolean()),
      ...isolationParam(isWorktreeIsolationEnabled())
    }),
    execute: async (_toolCallId, params, signal, _onUpdate, ctx) => {
      if (params.resume) {
        const existing = context.manager.getRecord(params.resume);
        if (!ownsRecord(existing, context.parentAgentId)) {
          return textResult(`Nested agent not found or not owned by this parent: "${params.resume}".`, true);
        }
        const resumed = await context.manager.resume(params.resume, params.prompt, signal);
        return resumed ? textResult(formatRecord(resumed, "inline"), resumed.status === "error") : textResult(`Failed to resume nested agent "${params.resume}".`, true);
      }
      if (context.depth >= context.maxSubagentDepth) {
        return textResult(`Nested subagent call blocked (depth=${context.depth}, max=${context.maxSubagentDepth}). Complete the task directly.`, true);
      }
      const registry2 = loadRegistry();
      const rawType = params.subagent_type;
      const resolvedType = resolveEnabledTypeIn(registry2, rawType);
      if (resolvedType === undefined) {
        return textResult(`Unknown or disabled nested agent type: "${rawType}". Allowed: ${availableIn(registry2).join(", ") || "none"}.`, true);
      }
      const allowed = allowedTypesIn(registry2);
      if (allowed !== undefined && !allowed.has(resolvedType)) {
        return textResult(`Nested agent type "${resolvedType}" is not allowed for this parent. Allowed: ${[...allowed].join(", ")}.`, true);
      }
      const config = getAgentConfigIn(registry2, resolvedType);
      const invocation = resolveAgentInvocationConfig(config, params, {
        worktreeAllowed: isWorktreeIsolationEnabled(),
        defaultRunInBackground: false
      });
      let model = ctx.model;
      if (invocation.modelInput) {
        const resolvedModel = resolveModel(invocation.modelInput, ctx.modelRegistry);
        if (typeof resolvedModel === "string") {
          if (invocation.modelFromParams)
            return textResult(resolvedModel, true);
        } else {
          model = resolvedModel;
        }
      }
      const scopeVerdict = checkModelScope({
        model,
        cwd: context.configCwd,
        modelRegistry: ctx.modelRegistry,
        callerSupplied: invocation.modelFromParams,
        agentLabel: config?.displayName ?? resolvedType,
        modelInput: invocation.modelInput
      });
      if (scopeVerdict.kind === "error")
        return textResult(scopeVerdict.message, true);
      const rootSessionId = context.manager.getRecord(context.parentAgentId)?.rootSessionId;
      const childDepth = context.depth + 1;
      const options = {
        description: params.description,
        model,
        maxTurns: invocation.maxTurns,
        isolated: invocation.isolated,
        inheritContext: invocation.inheritContext,
        thinkingLevel: invocation.thinking,
        isolation: invocation.isolation,
        invocation: {
          thinking: invocation.thinking,
          maxTurns: invocation.maxTurns,
          isolated: invocation.isolated,
          inheritContext: invocation.inheritContext,
          runInBackground: invocation.runInBackground,
          isolation: invocation.isolation
        },
        onAssistantUsage: (usage) => {
          for (let id = context.parentAgentId;id !== undefined; ) {
            const ancestor = context.manager.getRecord(id);
            if (!ancestor)
              break;
            addUsage(ancestor.lifetimeUsage, usage);
            id = ancestor.parentAgentId;
          }
        },
        depth: childDepth,
        parentAgentId: context.parentAgentId,
        maxSubagentDepth: context.maxSubagentDepth,
        configCwd: context.configCwd,
        rootSessionId
      };
      const transcriptSessionId = rootSessionId !== undefined && (config?.outputTranscript ?? getOutputTranscriptDefault()) ? rootSessionId : undefined;
      let childId;
      const attachTranscript = (id) => {
        childId = id;
        if (transcriptSessionId === undefined)
          return;
        const rec = context.manager.getRecord(id);
        if (!rec)
          return;
        rec.outputFile = createOutputFilePath(context.configCwd, id, transcriptSessionId);
        writeInitialEntry(rec.outputFile, id, params.prompt, ctx.cwd);
      };
      options.onSessionCreated = (session) => {
        const rec = childId === undefined ? undefined : context.manager.getRecord(childId);
        if (rec?.outputFile && childId !== undefined) {
          rec.outputCleanup = streamToOutputFile(session, rec.outputFile, childId, ctx.cwd);
        }
      };
      try {
        if (invocation.runInBackground) {
          const id = context.manager.spawn(context.pi, ctx, resolvedType, params.prompt, {
            ...options,
            isBackground: true
          });
          attachTranscript(id);
          await context.manager.awaitStartup(id);
          return textResult(`Nested agent started in background. Agent ID: ${id}`);
        }
        const { record: record3 } = await context.manager.spawnAndWait(context.pi, ctx, resolvedType, params.prompt, { ...options, signal }, attachTranscript);
        return textResult(formatRecord(record3, "inline"), record3.status === "error");
      } catch (err) {
        return textResult(err instanceof Error ? err.message : String(err), true);
      }
    }
  });
  const resultTool = defineTool({
    name: NESTED_TOOL_NAMES[1],
    label: "Get Nested Agent Result",
    description: "Check or wait for a background nested agent owned by this parent.",
    parameters: Type.Object({
      agent_id: Type.String(),
      wait: Type.Optional(Type.Boolean())
    }),
    execute: async (_toolCallId, params, signal) => {
      const record3 = context.manager.getRecord(params.agent_id);
      if (!ownsRecord(record3, context.parentAgentId)) {
        return textResult(`Nested agent not found or not owned by this parent: "${params.agent_id}".`, true);
      }
      if (params.wait && (record3.status === "queued" || record3.status === "running")) {
        while (record3.status === "queued") {
          await abortable(new Promise((resolve) => setTimeout(resolve, 250)), signal);
        }
        if (record3.promise)
          await abortable(record3.promise, signal);
      }
      return textResult(formatRecord(record3, "fetched"), record3.status === "error");
    }
  });
  const steerTool = defineTool({
    name: NESTED_TOOL_NAMES[2],
    label: "Steer Nested Agent",
    description: "Send guidance to a running nested agent owned by this parent.",
    parameters: Type.Object({
      agent_id: Type.String(),
      message: Type.String()
    }),
    execute: async (_toolCallId, params) => {
      const record3 = context.manager.getRecord(params.agent_id);
      if (!ownsRecord(record3, context.parentAgentId) || record3.status !== "running") {
        return textResult(`Running nested agent not found or not owned by this parent: "${params.agent_id}".`, true);
      }
      if (!record3.session) {
        if (!record3.pendingSteers)
          record3.pendingSteers = [];
        record3.pendingSteers.push(params.message);
        return textResult(`Steering message queued for nested agent ${params.agent_id}.`);
      }
      try {
        await record3.session.steer(params.message);
      } catch (err) {
        return textResult(`Failed to steer nested agent: ${err instanceof Error ? err.message : String(err)}`, true);
      }
      return textResult(`Steering message sent to nested agent ${params.agent_id}.`);
    }
  });
  return [agentTool, resultTool, steerTool];
}
var maxSubagentDepth = 2, NESTED_TOOL_NAMES;
var init_nested_tools = __esm(() => {
  init_esm();
  init_agent_types();
  init_custom_agents();
  init_invocation_config();
  init_model_scope();
  init_output_file();
  init_worktree();
  NESTED_TOOL_NAMES = ["Agent", "get_subagent_result", "steer_subagent"];
});

// src/prompts.ts
function buildAgentPrompt(config, cwd, env, parentSystemPrompt, extras) {
  const activeAgentTag = `<active_agent name="${config.name}"/>

`;
  const envBlock = `# Environment
Working directory: ${cwd}
${env.isGitRepo ? `Git repository: yes
Branch: ${env.branch}` : "Not a git repository"}
Platform: ${env.platform}`;
  const worktreeBlock = extras?.worktreeBase ? `

<worktree_isolation>
Your working directory is an isolated git worktree copy of ${extras.worktreeBase}.
Work only inside it — never in ${extras.worktreeBase}, even if other instructions name that path as your working directory.
</worktree_isolation>` : "";
  const workflowBlock = extras?.workflowChild ? `

<workflow_child>
Your final message IS the return value of this task. A workflow script captures it and passes it to the next stage; no person reads it.
Return only the answer, in exactly the shape the prompt asks for — no preamble, no summary of what you did, no offer to continue.
</workflow_child>` : "";
  const extraSections = [];
  if (extras?.memoryBlock) {
    extraSections.push(extras.memoryBlock);
  }
  if (extras?.skillBlocks?.length) {
    for (const skill of extras.skillBlocks) {
      extraSections.push(`
# Preloaded Skill: ${skill.name}
${skill.content}`);
    }
  }
  const extrasSuffix = extraSections.length > 0 ? `

` + extraSections.join(`
`) : "";
  if (config.promptMode === "append") {
    const identity = parentSystemPrompt || genericBase;
    const bridge = `<sub_agent_context>
You are operating as a sub-agent invoked to handle a specific task.
- Use the read tool instead of cat/head/tail
- Use the edit tool instead of sed/awk
- Use the write tool instead of echo/heredoc
- Use the find tool instead of bash find/ls for file search
- Use the grep tool instead of bash grep/rg for content search
- Make independent tool calls in parallel
- Use absolute file paths
- Do not use emojis
- Be concise but complete
</sub_agent_context>`;
    const customSection = config.systemPrompt?.trim() ? `

<agent_instructions>
${config.systemPrompt}
</agent_instructions>` : "";
    return identity + `

` + bridge + `

` + activeAgentTag + envBlock + worktreeBlock + workflowBlock + customSection + extrasSuffix;
  }
  const replaceHeader = `You are a pi coding agent sub-agent.
You have been invoked to handle a specific task autonomously.

${envBlock}`;
  return activeAgentTag + replaceHeader + worktreeBlock + workflowBlock + `

` + config.systemPrompt + extrasSuffix;
}
var genericBase = `# Role
You are a general-purpose coding agent for complex, multi-step tasks.
You have full access to read, write, edit files, and execute commands.
Do what has been asked; nothing more, nothing less.`;

// src/skill-loader.ts
import { existsSync as existsSync6, readdirSync as readdirSync2 } from "node:fs";
import { homedir as homedir2 } from "node:os";
import { join as join7 } from "node:path";
import { getAgentDir as getAgentDir5 } from "@earendil-works/pi-coding-agent";
function preloadSkills(skillNames, cwd) {
  return skillNames.map((name) => ({ name, content: loadSkillContent(name, cwd) }));
}
function loadSkillContent(name, cwd) {
  if (isUnsafeName(name)) {
    return `(Skill "${name}" skipped: name contains path traversal characters)`;
  }
  const roots = [
    join7(cwd, ".pi", "skills"),
    join7(cwd, ".agents", "skills"),
    join7(getAgentDir5(), "skills"),
    join7(homedir2(), ".agents", "skills"),
    join7(homedir2(), ".pi", "skills")
  ];
  for (const root of roots) {
    const content = findInRoot(root, name);
    if (content !== undefined)
      return content;
  }
  return `(Skill "${name}" not found in .pi/skills/, .agents/skills/, or global skill locations)`;
}
function findInRoot(root, name) {
  if (isSymlink(root))
    return;
  const flat = safeReadFile(join7(root, `${name}.md`))?.trim();
  if (flat !== undefined)
    return flat;
  return findSkillDirectory(root, name);
}
function findSkillDirectory(root, name) {
  if (!existsSync6(root))
    return;
  const queue = [root];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined)
      continue;
    let entries;
    try {
      entries = readdirSync2(current, { withFileTypes: true });
    } catch {
      continue;
    }
    entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    for (const entry of entries) {
      if (!entry.isDirectory())
        continue;
      if (entry.name.startsWith(".") || entry.name === "node_modules")
        continue;
      const path = join7(current, entry.name);
      const skillMd = join7(path, "SKILL.md");
      const isSkillDir = existsSync6(skillMd);
      if (isSkillDir) {
        if (entry.name === name) {
          const content = safeReadFile(skillMd)?.trim();
          if (content !== undefined)
            return content;
        }
        continue;
      }
      queue.push(path);
    }
  }
  return;
}
var init_skill_loader = __esm(() => {
  init_memory();
});

// src/structured-output.ts
import { defineTool as defineTool2 } from "@earendil-works/pi-coding-agent";
function createStructuredCapture() {
  return { called: false };
}
function createStructuredOutputTool(compiled, capture) {
  return defineTool2({
    name: STRUCTURED_OUTPUT_TOOL_NAME,
    label: "Structured Output",
    description: "Report your final answer. Call this exactly once, with the complete result, and put everything the " + "caller needs inside the arguments — text written outside this call is discarded. If a call is " + "rejected for not matching the schema, fix the reported fields and call it again.",
    promptSnippet: "Report your final answer as structured data",
    promptGuidelines: [
      "Your final answer MUST be reported by calling StructuredOutput. Prose outside that call is discarded."
    ],
    parameters: compiled.schema,
    constrainedSampling: { type: "json_schema", strict: "prefer" },
    prepareArguments: (args) => {
      if (typeof args !== "string")
        return args;
      try {
        return JSON.parse(args);
      } catch {
        return args;
      }
    },
    execute: async (_toolCallId, params) => {
      capture.called = true;
      const verdict = compiled.check(params);
      if (verdict !== true) {
        capture.lastError = verdict;
        return {
          content: [{
            type: "text",
            text: `StructuredOutput did not match the required schema:
${verdict}
Call it again with a corrected value.`
          }],
          isError: true,
          details: {}
        };
      }
      capture.json = JSON.stringify(params);
      capture.lastError = undefined;
      return { content: [{ type: "text", text: "Recorded." }], details: {} };
    }
  });
}
function structuredRetryPrompt(capture) {
  const reason = capture.called && capture.lastError !== undefined ? `Your last ${STRUCTURED_OUTPUT_TOOL_NAME} call did not match the required schema: ${capture.lastError}` : `You did not call ${STRUCTURED_OUTPUT_TOOL_NAME}, so your answer was not recorded.`;
  return `${reason}

Call ${STRUCTURED_OUTPUT_TOOL_NAME} now with your complete final answer. Do not reply with prose.`;
}
var STRUCTURED_OUTPUT_TOOL_NAME = "StructuredOutput";
var init_structured_output = () => {};

// src/agent-runner.ts
import { readFileSync as readFileSync4 } from "node:fs";
import { homedir as homedir3 } from "node:os";
import { basename as basename2, dirname, isAbsolute, join as join8, resolve } from "node:path";
import {
  createAgentSession,
  DefaultResourceLoader,
  getAgentDir as getAgentDir6,
  SessionManager,
  SettingsManager
} from "@earendil-works/pi-coding-agent";
function extensionCanonicalName(extPath) {
  const base = basename2(extPath);
  const name = base === "index.ts" || base === "index.js" ? basename2(dirname(extPath)) : base.replace(/\.(ts|js)$/, "");
  return name.toLowerCase();
}
function extensionPackageName(extPath) {
  const entry = resolve(extPath);
  let dir = dirname(extPath);
  for (;; ) {
    if (basename2(dir) === "node_modules")
      return;
    let pkg;
    try {
      pkg = JSON.parse(readFileSync4(join8(dir, "package.json"), "utf-8"));
    } catch {
      const parent = dirname(dir);
      if (parent === dir)
        return;
      dir = parent;
      continue;
    }
    const entries = pkg.pi?.extensions;
    if (typeof pkg.name === "string" && Array.isArray(entries) && entries.some((e) => typeof e === "string" && resolve(dir, e) === entry)) {
      const short = pkg.name.startsWith("@") ? pkg.name.slice(pkg.name.indexOf("/") + 1) : pkg.name;
      return short.toLowerCase();
    }
    return;
  }
}
function extensionCanonicalNames(extPath) {
  const canonical = extensionCanonicalName(extPath);
  const pkg = extensionPackageName(extPath);
  return pkg && pkg !== canonical ? [canonical, pkg] : [canonical];
}
function parseExtensionsSpec(entries, cwd) {
  const names = new Set;
  const paths = [];
  let wildcard = false;
  for (const entry of entries) {
    if (!entry)
      continue;
    if (entry === "*") {
      wildcard = true;
      continue;
    }
    const isPathEntry = entry.includes("/") || entry.includes("\\") || entry.startsWith("~");
    if (!isPathEntry) {
      names.add(entry.toLowerCase());
      continue;
    }
    let p = entry;
    if (p === "~" || p.startsWith("~/") || p.startsWith("~\\")) {
      p = homedir3() + p.slice(1);
    }
    const abs = isAbsolute(p) ? p : resolve(cwd, p);
    paths.push(abs);
    names.add(extensionCanonicalName(abs));
  }
  return { names, paths, wildcard };
}
function parseExtSelectors(entries) {
  const extNames = new Set;
  const narrowing = new Map;
  for (const raw of entries) {
    if (!raw)
      continue;
    const body = raw.slice("ext:".length);
    const slash = body.indexOf("/");
    const name = (slash === -1 ? body : body.slice(0, slash)).trim().toLowerCase();
    if (!name)
      continue;
    extNames.add(name);
    if (slash === -1)
      continue;
    const tool = body.slice(slash + 1).trim();
    if (!tool)
      continue;
    let set2 = narrowing.get(name);
    if (!set2) {
      set2 = new Set;
      narrowing.set(name, set2);
    }
    set2.add(tool);
  }
  return { extNames, narrowing };
}
function installExtensionToolScope(session, ctx) {
  const { loader, toolNames, disallowedSet, extNames, narrowing, readmitToolNames } = ctx;
  const inScope = () => {
    const keep = new Set(toolNames.filter((t) => !disallowedSet?.has(t)));
    const optInActive = extNames.size > 0;
    for (const extension of loader.getExtensions().extensions) {
      const canons = extensionCanonicalNames(extension.path);
      if (optInActive && !canons.some((c) => extNames.has(c)))
        continue;
      const narrowed = canons.map((c) => narrowing.get(c)).find(Boolean);
      for (const name of extension.tools.keys()) {
        if (narrowed && !narrowed.has(name))
          continue;
        if (disallowedSet?.has(name))
          continue;
        keep.add(name);
      }
    }
    for (const name of EXCLUDED_TOOL_NAMES)
      keep.delete(name);
    for (const name of readmitToolNames)
      keep.add(name);
    return keep;
  };
  const renarrow = () => {
    const allowed = inScope();
    const next = session.getAllTools().map((t) => t.name).filter((n) => allowed.has(n));
    const current = session.getActiveToolNames();
    if (next.length !== current.length || next.some((n, i) => n !== current[i])) {
      session.setActiveToolsByName(next);
    }
  };
  renarrow();
  session.subscribe((event) => {
    if (event.type === "turn_end")
      renarrow();
  });
  const priorBeforeToolCall = session.agent.beforeToolCall;
  session.agent.beforeToolCall = async (context, signal) => {
    if (!inScope().has(context.toolCall.name)) {
      return {
        block: true,
        reason: `Tool "${context.toolCall.name}" is not available to this subagent.`
      };
    }
    return priorBeforeToolCall?.(context, signal);
  };
}
function normalizeMaxTurns(n) {
  if (n == null || n === 0)
    return;
  return Math.max(1, n);
}
function getDefaultMaxTurns() {
  return defaultMaxTurns;
}
function setDefaultMaxTurns(n) {
  defaultMaxTurns = normalizeMaxTurns(n);
}
function resolveEffectiveMaxTurns(type4, explicit) {
  return normalizeMaxTurns(explicit ?? getAgentConfig(type4)?.maxTurns ?? defaultMaxTurns);
}
function getRememberAgents() {
  return rememberAgents;
}
function setRememberAgents(b) {
  rememberAgents = b;
}
function getGraceTurns() {
  return graceTurns;
}
function setGraceTurns(n) {
  graceTurns = Math.max(1, n);
}
function resolveDefaultModel(parentModel, registry2, configModel) {
  if (configModel) {
    const slashIdx = configModel.indexOf("/");
    if (slashIdx !== -1) {
      const provider = configModel.slice(0, slashIdx);
      const modelId = configModel.slice(slashIdx + 1);
      const available = registry2.getAvailable?.();
      const availableKeys = available ? new Set(available.map((m) => `${m.provider}/${m.id}`)) : undefined;
      const isAvailable = (p, id) => !availableKeys || availableKeys.has(`${p}/${id}`);
      const found = registry2.find(provider, modelId);
      if (found && isAvailable(provider, modelId))
        return found;
    }
  }
  return parentModel;
}
function collectResponseText(session) {
  let text = "";
  const unsubscribe = session.subscribe((event) => {
    if (event.type === "message_start" && event.message.role === "assistant") {
      text = "";
    }
    if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
      text += event.assistantMessageEvent.delta;
    }
  });
  return { getText: () => text, unsubscribe };
}
function getLastAssistantText(session, startIndex = 0) {
  for (let i = session.messages.length - 1;i >= startIndex; i--) {
    const msg = session.messages[i];
    if (msg.role !== "assistant")
      continue;
    const text = extractText(msg.content).trim();
    if (text)
      return text;
  }
  return "";
}
function finalTurnError(session, startIndex = 0) {
  for (let i = session.messages.length - 1;i >= startIndex; i--) {
    const msg = session.messages[i];
    if (msg.role !== "assistant")
      continue;
    if (msg.stopReason === "error") {
      return msg.errorMessage?.trim() || "provider error with no output";
    }
    if (msg.stopReason === "length" && !extractText(msg.content).trim()) {
      return "run hit the output token limit before producing any text";
    }
    return;
  }
  return;
}
function forwardAbortSignal(session, signal) {
  if (!signal)
    return () => {};
  const onAbort = () => session.abort();
  signal.addEventListener("abort", onAbort, { once: true });
  return () => signal.removeEventListener("abort", onAbort);
}
function resolveConfiguredSessionDir(sessionDir, cwd) {
  if (!sessionDir)
    return;
  if (sessionDir === "~" || sessionDir.startsWith("~/"))
    return resolve(homedir3(), sessionDir.slice(2));
  if (isAbsolute(sessionDir))
    return sessionDir;
  return resolve(cwd, sessionDir);
}
async function runAgent(ctx, type4, prompt, options) {
  const config = getConfig(type4);
  const agentConfig = getAgentConfig(type4);
  const effectiveCwd = options.cwd ?? ctx.cwd;
  const configCwd = options.configCwd ?? effectiveCwd;
  const env = await detectEnv(options.pi, effectiveCwd);
  const parentSystemPrompt = ctx.getSystemPrompt();
  const extras = {};
  if (options.worktreeBase)
    extras.worktreeBase = options.worktreeBase;
  if (options.workflow && !options.structuredOutput)
    extras.workflowChild = true;
  const extensions = options.isolated ? false : config.extensions;
  const excludeExtensions = options.isolated ? undefined : config.excludeExtensions;
  const skills = options.isolated ? false : config.skills;
  if (Array.isArray(skills)) {
    const loaded = preloadSkills(skills, configCwd);
    if (loaded.length > 0) {
      extras.skillBlocks = loaded;
    }
  }
  let toolNames = getToolNamesForType(type4);
  if (agentConfig?.memory) {
    const existingNames = new Set(toolNames);
    const denied = agentConfig.disallowedTools ? new Set(agentConfig.disallowedTools) : undefined;
    const effectivelyHas = (name) => existingNames.has(name) && !denied?.has(name);
    const hasWriteTools = effectivelyHas("write") || effectivelyHas("edit");
    if (hasWriteTools) {
      const extraNames = getMemoryToolNames(existingNames);
      if (extraNames.length > 0)
        toolNames = [...toolNames, ...extraNames];
      extras.memoryBlock = buildMemoryBlock(agentConfig.name, agentConfig.memory, configCwd);
    } else {
      const extraNames = getReadOnlyMemoryToolNames(existingNames);
      if (extraNames.length > 0)
        toolNames = [...toolNames, ...extraNames];
      extras.memoryBlock = buildReadOnlyMemoryBlock(agentConfig.name, agentConfig.memory, configCwd);
    }
  }
  let systemPrompt;
  if (agentConfig) {
    systemPrompt = buildAgentPrompt(agentConfig, effectiveCwd, env, parentSystemPrompt, extras);
  } else {
    const fallback = DEFAULT_AGENTS.get("general-purpose");
    if (!fallback)
      throw new Error(`No fallback config available for unknown type "${type4}"`);
    systemPrompt = buildAgentPrompt({ ...fallback, name: type4 }, effectiveCwd, env, parentSystemPrompt, extras);
  }
  const noSkills = skills === false || Array.isArray(skills);
  const agentDir = getAgentDir6();
  const { extNames, narrowing } = parseExtSelectors(options.isolated ? [] : agentConfig?.extSelectors ?? []);
  const noExtensions = extensions === false;
  const extensionsSpec = Array.isArray(extensions) ? parseExtensionsSpec(extensions, configCwd) : undefined;
  const keepNames = extensionsSpec?.names ?? new Set;
  const excludeNames = new Set((excludeExtensions ?? []).map((n) => n.toLowerCase()));
  const hasExcludes = excludeNames.size > 0;
  const loadAll = extensions === true || extensionsSpec?.wildcard === true;
  const additionalExtensionPaths = extensionsSpec?.paths.length ? extensionsSpec.paths : undefined;
  let discoveredNames;
  const extensionsOverride = noExtensions || loadAll && !hasExcludes ? undefined : (base) => {
    discoveredNames = new Set(base.extensions.flatMap((e) => extensionCanonicalNames(e.path)));
    return {
      ...base,
      extensions: base.extensions.filter((e) => {
        const canons = extensionCanonicalNames(e.path);
        if (canons.some((n) => excludeNames.has(n)))
          return false;
        return loadAll || canons.some((n) => keepNames.has(n));
      })
    };
  };
  const loader = new DefaultResourceLoader({
    cwd: configCwd,
    agentDir,
    noExtensions,
    additionalExtensionPaths,
    extensionsOverride,
    noSkills,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
    systemPromptOverride: () => systemPrompt,
    appendSystemPromptOverride: () => []
  });
  await runInChildSessionContext(() => loader.reload());
  if (agentConfig?.builtinToolNames?.length) {
    const knownBuiltins = new Set(BUILTIN_TOOL_NAMES);
    for (const name of agentConfig.builtinToolNames) {
      if (!knownBuiltins.has(name)) {
        options.onToolActivity?.({
          type: "end",
          toolName: `tools-error:tool "${name}" requested by agent "${type4}" is not a known built-in`
        });
      }
    }
  }
  if (hasExcludes && noExtensions) {
    options.onToolActivity?.({
      type: "end",
      toolName: `extension-error:exclude_extensions has no effect for agent "${type4}" — extensions: false loads nothing`
    });
  }
  if (hasExcludes && discoveredNames) {
    for (const name of excludeNames) {
      if (!discoveredNames.has(name)) {
        options.onToolActivity?.({
          type: "end",
          toolName: `extension-error:exclude_extensions: "${name}" for agent "${type4}" did not match any discovered extension`
        });
      }
    }
  }
  if (keepNames.size > 0 || extNames.size > 0) {
    const survivingNames = new Set(loader.getExtensions().extensions.flatMap((e) => extensionCanonicalNames(e.path)));
    for (const name of keepNames) {
      if (!survivingNames.has(name)) {
        options.onToolActivity?.({
          type: "end",
          toolName: excludeNames.has(name) ? `extension-error:extension "${name}" is in both extensions: and exclude_extensions: for agent "${type4}" — exclude wins` : `extension-error:extension "${name}" requested by agent "${type4}" was not loaded`
        });
      }
    }
    for (const name of extNames) {
      if (!survivingNames.has(name)) {
        options.onToolActivity?.({
          type: "end",
          toolName: `extension-error:ext:${name} referenced by agent "${type4}" but extension "${name}" is not loaded (check extensions:/exclude_extensions:)`
        });
      }
    }
  }
  const model = options.model ?? resolveDefaultModel(ctx.model, ctx.modelRegistry, agentConfig?.model);
  const thinkingLevel = options.thinkingLevel ?? agentConfig?.thinking;
  const disallowedSet = agentConfig?.disallowedTools ? new Set(agentConfig.disallowedTools) : undefined;
  const effectiveMaxDepth = options.nestedRuntime?.maxSubagentDepth ?? getMaxSubagentDepth();
  const nestedRuntime = options.nestedRuntime && options.nestedRuntime.depth < effectiveMaxDepth ? options.nestedRuntime : undefined;
  const nestedTools = agentConfig?.allowedSubagents && nestedRuntime && !options.isolated ? createNestedSubagentTools({
    manager: nestedRuntime.manager,
    pi: options.pi,
    parentAgentId: nestedRuntime.parentAgentId,
    depth: nestedRuntime.depth,
    maxSubagentDepth: effectiveMaxDepth,
    allowedSubagents: agentConfig.allowedSubagents,
    configCwd
  }) : [];
  const nestedToolNames = new Set(nestedTools.map((tool) => tool.name));
  const structuredCapture = options.structuredOutput ? createStructuredCapture() : undefined;
  const structuredTools = options.structuredOutput && structuredCapture ? [createStructuredOutputTool(options.structuredOutput, structuredCapture)] : [];
  const structuredToolNames = new Set(structuredTools.map((tool) => tool.name));
  const readmitToolNames = new Set([
    ...[...nestedToolNames].filter((name) => !disallowedSet?.has(name)),
    ...structuredToolNames
  ]);
  const builtinToolNameSet = new Set(toolNames);
  let sessionTools;
  let sessionExcludeTools;
  if (noExtensions) {
    sessionTools = [
      ...toolNames.filter((t) => !EXCLUDED_TOOL_NAMES.includes(t) && !disallowedSet?.has(t)),
      ...[...nestedToolNames].filter((t) => !disallowedSet?.has(t)),
      ...structuredToolNames
    ];
  } else {
    const denyTools = new Set(EXCLUDED_TOOL_NAMES.filter((t) => !nestedToolNames.has(t)));
    for (const name of BUILTIN_TOOL_NAMES) {
      if (!builtinToolNameSet.has(name))
        denyTools.add(name);
    }
    if (disallowedSet) {
      for (const name of disallowedSet) {
        if (!structuredToolNames.has(name))
          denyTools.add(name);
      }
    }
    sessionExcludeTools = [...denyTools];
  }
  const settingsManager = SettingsManager.create(configCwd, agentDir);
  const configuredSessionDir = resolveConfiguredSessionDir(agentConfig?.sessionDir, effectiveCwd);
  const defaultSessionDir = process.env.PI_CODING_AGENT_SESSION_DIR ?? settingsManager.getSessionDir?.();
  const persistSession = agentConfig?.persistSession ?? (options.nested ? false : rememberAgents);
  const sessionManager = options.resumeSessionFile ? SessionManager.open(options.resumeSessionFile, configuredSessionDir ?? defaultSessionDir) : persistSession ? SessionManager.create(effectiveCwd, configuredSessionDir ?? defaultSessionDir, {
    parentSession: ctx.sessionManager?.getSessionFile?.()
  }) : SessionManager.inMemory(effectiveCwd);
  const parentModelRuntime = ctx.modelRegistry.runtime;
  const sessionOpts = {
    cwd: effectiveCwd,
    agentDir,
    sessionManager,
    settingsManager,
    modelRegistry: ctx.modelRegistry,
    ...parentModelRuntime !== undefined && { modelRuntime: parentModelRuntime },
    model,
    tools: sessionTools,
    customTools: [...nestedTools, ...structuredTools],
    resourceLoader: loader
  };
  if (sessionExcludeTools) {
    sessionOpts.excludeTools = sessionExcludeTools;
  }
  if (thinkingLevel) {
    sessionOpts.thinkingLevel = thinkingLevel;
  }
  const { session } = await runInChildSessionContext(() => createAgentSession(sessionOpts));
  const baseSessionName = agentConfig?.name ?? type4;
  session.setSessionName(options.agentId ? `${baseSessionName}#${options.agentId.slice(0, 8)}` : baseSessionName);
  await session.bindExtensions({
    onError: (err) => {
      options.onToolActivity?.({
        type: "end",
        toolName: `extension-error:${err.extensionPath}`
      });
    }
  });
  if (!noExtensions) {
    installExtensionToolScope(session, {
      loader,
      toolNames,
      disallowedSet,
      extNames,
      narrowing,
      readmitToolNames
    });
  }
  options.onSessionCreated?.(session);
  let turnCount = 0;
  const maxTurns = resolveEffectiveMaxTurns(type4, options.maxTurns);
  let softLimitReached = false;
  let aborted = false;
  let currentMessageText = "";
  const unsubTurns = session.subscribe((event) => {
    if (event.type === "turn_end") {
      turnCount++;
      options.onTurnEnd?.(turnCount);
      if (maxTurns != null) {
        if (!softLimitReached && turnCount >= maxTurns) {
          softLimitReached = true;
          session.steer("You have reached your turn limit. Wrap up immediately — provide your final answer now.");
        } else if (softLimitReached && turnCount >= maxTurns + graceTurns) {
          aborted = true;
          session.abort();
        }
      }
    }
    if (event.type === "message_start") {
      currentMessageText = "";
    }
    if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
      currentMessageText += event.assistantMessageEvent.delta;
      options.onTextDelta?.(event.assistantMessageEvent.delta, currentMessageText);
    }
    if (event.type === "tool_execution_start") {
      options.onToolActivity?.({ type: "start", toolName: event.toolName });
    }
    if (event.type === "tool_execution_end") {
      options.onToolActivity?.({ type: "end", toolName: event.toolName });
    }
    if (event.type === "message_end" && event.message.role === "assistant") {
      const u = event.message.usage;
      if (u)
        options.onAssistantUsage?.({
          input: u.input ?? 0,
          output: u.output ?? 0,
          cacheWrite: u.cacheWrite ?? 0,
          cacheRead: u.cacheRead ?? 0,
          cost: u.cost?.total ?? 0
        });
    }
    if (event.type === "compaction_end" && !event.aborted && event.result) {
      options.onCompaction?.({ reason: event.reason, tokensBefore: event.result.tokensBefore });
    }
  });
  const collector = collectResponseText(session);
  const cleanupAbort = forwardAbortSignal(session, options.signal);
  let effectivePrompt = prompt;
  if (options.inheritContext) {
    const parentContext = buildParentContext(ctx);
    if (parentContext) {
      effectivePrompt = parentContext + prompt;
    }
  }
  const startLen = session.messages.length;
  let structuredRetried = false;
  try {
    await session.prompt(effectivePrompt);
    if (structuredCapture !== undefined && structuredCapture.json === undefined && !aborted && options.signal?.aborted !== true) {
      structuredRetried = true;
      await session.prompt(structuredRetryPrompt(structuredCapture));
    }
  } finally {
    unsubTurns();
    collector.unsubscribe();
    cleanupAbort();
  }
  const responseText = collector.getText().trim() || getLastAssistantText(session, startLen);
  const structuredFailure = structuredCapture !== undefined && structuredCapture.json === undefined ? structuredCapture.lastError !== undefined ? `The agent's StructuredOutput call did not match the required schema: ${structuredCapture.lastError}` : "The agent did not report its answer through StructuredOutput." : undefined;
  return {
    responseText,
    session,
    aborted,
    steered: softLimitReached,
    failure: finalTurnError(session, startLen) ?? structuredFailure,
    ...structuredCapture?.json !== undefined ? { structuredJson: structuredCapture.json } : {},
    ...structuredRetried ? { structuredRetried } : {}
  };
}
async function resumeAgent(session, prompt, options = {}) {
  const startLen = session.messages.length;
  const collector = collectResponseText(session);
  const cleanupAbort = forwardAbortSignal(session, options.signal);
  const unsubEvents = options.onToolActivity || options.onAssistantUsage || options.onCompaction ? session.subscribe((event) => {
    if (event.type === "tool_execution_start")
      options.onToolActivity?.({ type: "start", toolName: event.toolName });
    if (event.type === "tool_execution_end")
      options.onToolActivity?.({ type: "end", toolName: event.toolName });
    if (event.type === "message_end" && event.message.role === "assistant") {
      const u = event.message.usage;
      if (u)
        options.onAssistantUsage?.({
          input: u.input ?? 0,
          output: u.output ?? 0,
          cacheWrite: u.cacheWrite ?? 0,
          cacheRead: u.cacheRead ?? 0,
          cost: u.cost?.total ?? 0
        });
    }
    if (event.type === "compaction_end" && !event.aborted && event.result) {
      options.onCompaction?.({ reason: event.reason, tokensBefore: event.result.tokensBefore });
    }
  }) : () => {};
  try {
    await session.prompt(prompt);
  } finally {
    collector.unsubscribe();
    unsubEvents();
    cleanupAbort();
  }
  return {
    text: collector.getText().trim() || getLastAssistantText(session, startLen),
    failure: finalTurnError(session, startLen)
  };
}
async function steerAgent(session, message) {
  await session.steer(message);
}
function getAgentConversation(session) {
  const parts = [];
  for (const msg of session.messages) {
    if (msg.role === "user") {
      const text = typeof msg.content === "string" ? msg.content : extractText(msg.content);
      if (text.trim())
        parts.push(`[User]: ${text.trim()}`);
    } else if (msg.role === "assistant") {
      const textParts = [];
      const toolCalls = [];
      for (const c of msg.content) {
        if (c.type === "text" && c.text)
          textParts.push(c.text);
        else if (c.type === "toolCall")
          toolCalls.push(`  Tool: ${c.name ?? c.toolName ?? "unknown"}`);
      }
      if (textParts.length > 0)
        parts.push(`[Assistant]: ${textParts.join(`
`)}`);
      if (toolCalls.length > 0)
        parts.push(`[Tool Calls]:
${toolCalls.join(`
`)}`);
    } else if (msg.role === "toolResult") {
      const text = extractText(msg.content);
      const truncated = text.length > 200 ? text.slice(0, 200) + "..." : text;
      parts.push(`[Tool Result (${msg.toolName})]: ${truncated}`);
    }
  }
  return parts.join(`

`);
}
var SUBAGENT_TOOL_NAMES, EXCLUDED_TOOL_NAMES, defaultMaxTurns, rememberAgents = true, graceTurns = 5;
var init_agent_runner = __esm(() => {
  init_agent_types();
  init_child_context();
  init_default_agents();
  init_memory();
  init_nested_tools();
  init_skill_loader();
  init_structured_output();
  SUBAGENT_TOOL_NAMES = {
    AGENT: "Agent",
    WORKFLOW: "SubagentWorkflow",
    GET_RESULT: "get_subagent_result",
    STEER: "steer_subagent"
  };
  EXCLUDED_TOOL_NAMES = Object.values(SUBAGENT_TOOL_NAMES);
});

// src/mention.ts
function isReservedHandle(handle) {
  return RESERVED_HANDLES.has(handle.toLowerCase());
}
function handleBase(type4) {
  const slug = type4.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, MAX_HANDLE_LENGTH).replace(/-+$/, "");
  return slug || "agent";
}
function assignHandle(base, taken) {
  let candidate = base;
  let n = 1;
  while (taken.has(candidate) || RESERVED_HANDLES.has(candidate)) {
    n++;
    candidate = `${base}-${n}`;
  }
  return candidate;
}
function resolveHandleToType(handle, types) {
  const wanted = handle.toLowerCase();
  if (RESERVED_HANDLES.has(wanted))
    return;
  return types.find((type4) => handleBase(type4) === wanted);
}
function stripAgentPrefix(handle) {
  const rest3 = /^agent-(.+)$/i.exec(handle)?.[1];
  return rest3 || undefined;
}
function describeMention(message) {
  const oneLine = message.split(`
`, 1)[0].replace(/\s+/g, " ").trim();
  return oneLine.length > 40 ? `${oneLine.slice(0, 39).trimEnd()}…` : oneLine;
}
function agentMentionReminder(type4) {
  return `<system-reminder>
The user has expressed a desire to invoke the agent "${type4}". Please invoke the agent appropriately, passing in the required context to it. 
</system-reminder>`;
}
function parseMention(text) {
  const match = MENTION_SEND.exec(text);
  if (!match)
    return null;
  const message = match[2].trim();
  return message ? { handle: match[1], message } : null;
}
var MENTION_TRIGGER, MENTION_SEND, MAX_HANDLE_LENGTH = 64, RESERVED_HANDLES;
var init_mention = __esm(() => {
  MENTION_TRIGGER = /(^|[\s。、？！])@([\w-]*)$/;
  MENTION_SEND = /^@([\w-]+)\s+([\s\S]+)$/;
  RESERVED_HANDLES = new Set(["main"]);
});

// src/agent-manager.ts
import { randomUUID as randomUUID2 } from "node:crypto";
import { statSync as statSync2 } from "node:fs";
import { isAbsolute as isAbsolute2 } from "node:path";
function assertValidSpawnCwd(cwd) {
  if (cwd == null)
    return;
  if (typeof cwd !== "string" || !isAbsolute2(cwd)) {
    throw new Error(`SpawnOptions.cwd must be an absolute path: "${String(cwd)}"`);
  }
  let isDirectory = false;
  try {
    isDirectory = statSync2(cwd).isDirectory();
  } catch {
    throw new Error(`SpawnOptions.cwd does not exist: "${cwd}"`);
  }
  if (!isDirectory) {
    throw new Error(`SpawnOptions.cwd is not a directory: "${cwd}"`);
  }
}
function occupiesPoolSlot(record3) {
  return !!record3.isBackground && isTopLevelAgent(record3);
}
function isTopLevelAgent(record3) {
  return record3.parentAgentId === undefined && record3.workflowId === undefined;
}
function occupiesForegroundSlot(record3) {
  return !!record3.blocking && isTopLevelAgent(record3);
}
async function shutdownChildSession(session) {
  try {
    const runner = session?.extensionRunner;
    if (runner?.hasHandlers?.("session_shutdown")) {
      await Promise.race([
        runner.emit({ type: "session_shutdown", reason: "quit" }),
        new Promise((resolve2) => setTimeout(resolve2, CHILD_SHUTDOWN_TIMEOUT_MS).unref())
      ]);
    }
  } catch {}
  try {
    session?.dispose?.();
  } catch {}
}

class AgentManager {
  agents = new Map;
  cleanupInterval;
  onComplete;
  onStart;
  onCompact;
  onUsage;
  maxConcurrent;
  maxConcurrentForeground = DEFAULT_MAX_CONCURRENT_FOREGROUND;
  worktreeRepos = new Set;
  startups = new Map;
  tombstones = new Map;
  queue = [];
  runningBackground = 0;
  runningForeground = 0;
  constructor(onComplete, maxConcurrent = DEFAULT_MAX_CONCURRENT, onStart, onCompact, onUsage) {
    this.onComplete = onComplete;
    this.onStart = onStart;
    this.onCompact = onCompact;
    this.onUsage = onUsage;
    this.maxConcurrent = maxConcurrent;
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    this.cleanupInterval.unref();
  }
  setMaxConcurrent(n) {
    this.maxConcurrent = Math.max(1, n);
    this.drainQueue();
  }
  getMaxConcurrent() {
    return this.maxConcurrent;
  }
  setMaxConcurrentForeground(n) {
    this.maxConcurrentForeground = Math.max(0, n);
    this.drainQueue();
  }
  getMaxConcurrentForeground() {
    return this.maxConcurrentForeground;
  }
  poolFor(record3) {
    if (occupiesPoolSlot(record3))
      return "background";
    if (this.maxConcurrentForeground > 0 && occupiesForegroundSlot(record3))
      return "foreground";
    return;
  }
  poolHasRoom(pool) {
    return pool === "background" ? this.runningBackground < this.maxConcurrent : this.maxConcurrentForeground === 0 || this.runningForeground < this.maxConcurrentForeground;
  }
  spawn(pi, ctx, type4, prompt, options) {
    assertValidSpawnCwd(options.cwd);
    const id = randomUUID2().slice(0, 17);
    const abortController = new AbortController;
    const record3 = {
      id,
      type: type4,
      handle: !isTopLevelAgent(options) ? undefined : options.reclaim?.handle ?? assignHandle(handleBase(type4), this.takenHandles()),
      description: options.description,
      alias: isTopLevelAgent(options) ? options.reclaim?.alias : undefined,
      status: options.isBackground ? "queued" : "running",
      toolUses: 0,
      startedAt: Date.now(),
      abortController,
      lifetimeUsage: { input: 0, output: 0, cacheWrite: 0, cost: 0 },
      compactionCount: 0,
      isBackground: options.isBackground,
      blocking: options.blocking,
      invocation: options.invocation,
      depth: options.depth ?? 1,
      parentAgentId: options.parentAgentId,
      workflowId: options.workflowId,
      maxSubagentDepth: options.maxSubagentDepth,
      rootSessionId: options.rootSessionId
    };
    this.agents.set(id, record3);
    if (record3.handle !== undefined && record3.alias === undefined && options.name !== undefined) {
      record3.alias = assignHandle(handleBase(options.name), this.takenHandles());
    }
    const args = { pi, ctx, type: type4, prompt, options };
    const pool = this.poolFor(record3);
    if (pool !== undefined && !options.bypassQueue && !this.poolHasRoom(pool)) {
      record3.status = "queued";
      if (!this.armQueuedAbort(id, options.signal))
        return id;
      let release;
      record3.startGate = new Promise((resolve2) => {
        release = resolve2;
      });
      this.queue.push({
        id,
        pool,
        start: () => this.launch(id, record3, args, pool),
        release: () => release()
      });
      options.onQueued?.(id, this.queue.filter((e) => e.pool === pool).length - 1);
      return id;
    }
    this.launch(id, record3, args, undefined);
    return id;
  }
  armQueuedAbort(id, signal) {
    if (signal === undefined)
      return true;
    if (signal.aborted) {
      const record3 = this.agents.get(id);
      if (record3) {
        record3.status = "stopped";
        record3.completedAt = Date.now();
      }
      return false;
    }
    signal.addEventListener("abort", () => this.abort(id), { once: true });
    return true;
  }
  launch(id, record3, args, queuedPool) {
    const startup = this.startAgent(id, record3, args).then(() => {
      this.startups.delete(id);
    }, (err) => {
      this.startups.delete(id);
      if (queuedPool !== undefined) {
        if (queuedPool === "foreground")
          record3.resultConsumed = true;
        record3.status = "error";
        record3.error = err instanceof Error ? err.message : String(err);
        record3.completedAt = Date.now();
        this.onComplete?.(record3);
      } else {
        this.agents.delete(id);
      }
      this.drainQueue();
      throw err;
    });
    this.startups.set(id, startup);
    return startup.catch(() => {});
  }
  awaitStartup(id) {
    return this.startups.get(id) ?? Promise.resolve();
  }
  async startAgent(id, record3, { pi, ctx, type: type4, prompt, options }) {
    assertValidSpawnCwd(options.cwd);
    const customCwd = options.cwd ?? undefined;
    const baseCwd = customCwd ?? ctx.cwd;
    const pool = this.poolFor(record3);
    const releaseSlot = () => {
      if (pool === "background")
        this.runningBackground--;
      else if (pool === "foreground")
        this.runningForeground--;
    };
    record3.status = "running";
    record3.startedAt = Date.now();
    record3.startGate = undefined;
    if (pool === "background")
      this.runningBackground++;
    else if (pool === "foreground")
      this.runningForeground++;
    let worktreeCwd;
    if (options.isolation === "worktree" && isWorktreeIsolationEnabled()) {
      const wt = await createWorktree(pi, baseCwd, id);
      if (!wt) {
        releaseSlot();
        throw new Error('Cannot run with isolation: "worktree" — not a git repo, no commits yet, or `git worktree add` failed. ' + "Initialize git and commit at least once, or omit `isolation`.");
      }
      record3.worktree = wt;
      worktreeCwd = customCwd !== undefined ? wt.workPath : wt.path;
      this.worktreeRepos.add(baseCwd);
      if (record3.status !== "running") {
        releaseSlot();
        record3.worktreeResult = await cleanupWorktree(pi, baseCwd, wt, options.description);
        this.drainQueue();
        return;
      }
    }
    this.onStart?.(record3);
    let detachParentSignal;
    if (options.signal) {
      if (options.signal.aborted)
        this.abort(id);
      else {
        const onParentAbort = () => this.abort(id);
        options.signal.addEventListener("abort", onParentAbort, { once: true });
        detachParentSignal = () => options.signal.removeEventListener("abort", onParentAbort);
      }
    }
    const detach = () => {
      detachParentSignal?.();
      detachParentSignal = undefined;
    };
    const promise3 = runAgent(ctx, type4, prompt, {
      pi,
      agentId: id,
      model: options.model,
      maxTurns: options.maxTurns,
      isolated: options.isolated,
      inheritContext: options.inheritContext,
      thinkingLevel: options.thinkingLevel,
      structuredOutput: options.structuredOutput,
      resumeSessionFile: options.resumeSessionFile,
      nested: options.parentAgentId !== undefined,
      workflow: options.workflowId !== undefined,
      cwd: worktreeCwd ?? customCwd,
      worktreeBase: worktreeCwd ? baseCwd : undefined,
      configCwd: options.configCwd ?? (customCwd !== undefined ? ctx.cwd : undefined),
      signal: record3.abortController.signal,
      onToolActivity: (activity) => {
        if (activity.type === "end")
          record3.toolUses++;
        options.onToolActivity?.(activity);
      },
      onTurnEnd: options.onTurnEnd,
      onTextDelta: options.onTextDelta,
      onAssistantUsage: (usage) => {
        addUsage(record3.lifetimeUsage, usage);
        this.onUsage?.(record3, usage);
        options.onAssistantUsage?.(usage);
      },
      onCompaction: (info) => {
        record3.compactionCount++;
        this.onCompact?.(record3, info);
        options.onCompaction?.(info);
      },
      nestedRuntime: {
        manager: this,
        parentAgentId: id,
        depth: record3.depth ?? 1,
        maxSubagentDepth: record3.maxSubagentDepth
      },
      onSessionCreated: (session) => {
        record3.session = session;
        record3.sessionFile = session.sessionManager?.getSessionFile?.();
        if (session.model) {
          record3.invocation ??= {};
          const requested = record3.invocation.requestedThinking ?? record3.invocation.thinking;
          Object.assign(record3.invocation, describeModel(session.model));
          if (session.thinkingLevel) {
            record3.invocation.thinking = session.thinkingLevel;
            if (requested && requested !== session.thinkingLevel) {
              record3.invocation.requestedThinking = requested;
            }
          }
        }
        if (record3.pendingSteers?.length) {
          for (const msg of record3.pendingSteers) {
            session.steer(msg).catch(() => {});
          }
          record3.pendingSteers = undefined;
        }
        options.onSessionCreated?.(session);
      }
    }).then(async ({ responseText, session, aborted, steered, failure, structuredJson, structuredRetried }) => {
      if (record3.status !== "stopped") {
        if (aborted) {
          record3.status = "aborted";
        } else if (failure) {
          record3.status = "error";
          record3.error = failure;
        } else {
          record3.status = steered ? "steered" : "completed";
        }
      }
      record3.result = responseText;
      record3.structuredJson = structuredJson;
      record3.structuredRetried = structuredRetried;
      record3.session = session;
      record3.completedAt ??= Date.now();
      detach();
      if (record3.outputCleanup) {
        try {
          record3.outputCleanup();
        } catch {}
        record3.outputCleanup = undefined;
      }
      if (record3.worktree) {
        if (options.onBeforeWorktreeCleanup) {
          try {
            await options.onBeforeWorktreeCleanup(record3.worktree.path);
          } catch {}
        }
        const wtResult = await cleanupWorktree(pi, baseCwd, record3.worktree, options.description);
        record3.worktreeResult = wtResult;
        if (wtResult.hasChanges && wtResult.branch) {
          const repoNote = customCwd !== undefined ? ` in \`${baseCwd}\`` : "";
          record3.result = (record3.result ?? "") + `

---
Changes saved to branch \`${wtResult.branch}\`${repoNote}. Merge with: \`git merge ${wtResult.branch}\`${customCwd !== undefined ? ` (run in \`${baseCwd}\`)` : ""}`;
        }
      }
      this.abortOwnedChildren(id);
      this.settleRun(record3, true, pool);
      return responseText;
    }).catch(async (err) => {
      if (record3.status !== "stopped") {
        record3.status = "error";
      }
      record3.error = err instanceof Error ? err.message : String(err);
      record3.completedAt ??= Date.now();
      detach();
      if (record3.outputCleanup) {
        try {
          record3.outputCleanup();
        } catch {}
        record3.outputCleanup = undefined;
      }
      if (record3.worktree) {
        try {
          const wtResult = await cleanupWorktree(pi, baseCwd, record3.worktree, options.description);
          record3.worktreeResult = wtResult;
        } catch {}
      }
      this.abortOwnedChildren(id);
      this.settleRun(record3, false, pool);
      return "";
    });
    record3.promise = promise3;
    options.onSpawned?.(id);
  }
  settleRun(record3, guardCallback, pool) {
    if (!record3.isBackground)
      record3.resultConsumed = true;
    if (pool === "background")
      this.runningBackground--;
    else if (pool === "foreground")
      this.runningForeground--;
    if (guardCallback) {
      try {
        this.onComplete?.(record3);
      } catch {}
    } else {
      this.onComplete?.(record3);
    }
    if (record3.isBackground || pool !== undefined)
      this.drainQueue();
  }
  abortOwnedChildren(parentId) {
    for (const [id, record3] of this.agents) {
      if (record3.parentAgentId === parentId)
        this.abort(id);
    }
  }
  drainQueue() {
    for (;; ) {
      const i = this.queue.findIndex((e) => this.poolHasRoom(e.pool));
      if (i === -1)
        return;
      const [next] = this.queue.splice(i, 1);
      const record3 = this.agents.get(next.id);
      if (!record3 || record3.status !== "queued") {
        next.release();
        continue;
      }
      next.start().then(() => next.release(), () => next.release());
    }
  }
  dequeue(pred) {
    const kept = [];
    for (const entry of this.queue) {
      if (pred(entry))
        entry.release();
      else
        kept.push(entry);
    }
    this.queue = kept;
  }
  async spawnAndWait(pi, ctx, type4, prompt, options, onSpawned) {
    const id = this.spawn(pi, ctx, type4, prompt, {
      ...options,
      isBackground: false,
      blocking: true,
      onSpawned
    });
    const record3 = this.agents.get(id);
    if (record3.status === "queued")
      await record3.startGate;
    await this.awaitStartup(id);
    if (record3.promise)
      await record3.promise;
    if (record3.promise === undefined && record3.status === "error") {
      throw new Error(record3.error ?? "Agent failed to start");
    }
    return { id, record: record3 };
  }
  async resume(id, prompt, signal, options) {
    const record3 = this.agents.get(id);
    if (!record3?.session)
      return;
    if (options?.isBackground) {
      if (record3.status === "running" || record3.status === "queued")
        return;
      record3.isBackground = true;
      record3.resultConsumed = false;
      record3.result = undefined;
      record3.error = undefined;
      record3.completedAt = undefined;
      record3.status = "queued";
      const start = () => this.startResume(id, record3, prompt, signal, options);
      if (occupiesPoolSlot(record3) && !this.poolHasRoom("background")) {
        this.queue.push({
          id,
          pool: "background",
          start: async () => {
            try {
              start();
            } catch (err) {
              record3.status = "error";
              record3.error = err instanceof Error ? err.message : String(err);
              record3.completedAt = Date.now();
              this.onComplete?.(record3);
            }
          },
          release: () => {}
        });
      } else {
        start();
      }
      return record3;
    }
    record3.status = "running";
    record3.startedAt = Date.now();
    record3.completedAt = undefined;
    record3.result = undefined;
    record3.error = undefined;
    try {
      const { text, failure } = await resumeAgent(record3.session, prompt, {
        onToolActivity: (activity) => {
          if (activity.type === "end")
            record3.toolUses++;
          options?.onToolActivity?.(activity);
        },
        onAssistantUsage: (usage) => {
          addUsage(record3.lifetimeUsage, usage);
          this.onUsage?.(record3, usage);
          options?.onAssistantUsage?.(usage);
        },
        onCompaction: (info) => {
          record3.compactionCount++;
          this.onCompact?.(record3, info);
          options?.onCompaction?.(info);
        },
        signal
      });
      record3.status = failure ? "error" : "completed";
      if (failure)
        record3.error = failure;
      record3.result = text;
      record3.completedAt = Date.now();
    } catch (err) {
      record3.status = "error";
      record3.error = err instanceof Error ? err.message : String(err);
      record3.completedAt = Date.now();
    }
    this.abortOwnedChildren(id);
    return record3;
  }
  startResume(id, record3, prompt, parentSignal, options) {
    if (!record3.session)
      return;
    record3.status = "running";
    record3.startedAt = Date.now();
    if (occupiesPoolSlot(record3))
      this.runningBackground++;
    this.onStart?.(record3);
    const abortController = new AbortController;
    record3.abortController = abortController;
    let detachParentSignal;
    if (parentSignal) {
      const onParentAbort = () => this.abort(id);
      parentSignal.addEventListener("abort", onParentAbort, { once: true });
      detachParentSignal = () => parentSignal.removeEventListener("abort", onParentAbort);
    }
    try {
      options.onStarted?.();
    } catch {}
    const settle = () => {
      detachParentSignal?.();
      detachParentSignal = undefined;
      if (record3.outputCleanup) {
        try {
          record3.outputCleanup();
        } catch {}
        record3.outputCleanup = undefined;
      }
      this.abortOwnedChildren(id);
      if (occupiesPoolSlot(record3))
        this.runningBackground--;
      try {
        this.onComplete?.(record3);
      } catch {}
      this.drainQueue();
    };
    const promise3 = resumeAgent(record3.session, prompt, {
      onToolActivity: (activity) => {
        if (activity.type === "end")
          record3.toolUses++;
        options.onToolActivity?.(activity);
      },
      onAssistantUsage: (usage) => {
        addUsage(record3.lifetimeUsage, usage);
        this.onUsage?.(record3, usage);
        options.onAssistantUsage?.(usage);
      },
      onCompaction: (info) => {
        record3.compactionCount++;
        this.onCompact?.(record3, info);
        options.onCompaction?.(info);
      },
      signal: abortController.signal
    }).then(({ text, failure }) => {
      if (record3.status !== "stopped") {
        record3.status = failure ? "error" : "completed";
        if (failure)
          record3.error = failure;
      }
      record3.result = text;
      record3.completedAt ??= Date.now();
      settle();
      return text;
    }).catch((err) => {
      if (record3.status !== "stopped") {
        record3.status = "error";
        record3.error = err instanceof Error ? err.message : String(err);
      }
      record3.completedAt ??= Date.now();
      settle();
      return "";
    });
    record3.promise = promise3;
  }
  steer(id, message) {
    const record3 = this.agents.get(id);
    if (!record3)
      return false;
    if (record3.status !== "running" && record3.status !== "queued")
      return false;
    if (record3.session) {
      record3.session.steer(message).catch(() => {});
    } else {
      if (!record3.pendingSteers)
        record3.pendingSteers = [];
      record3.pendingSteers.push(message);
    }
    return true;
  }
  getRecord(id) {
    return this.agents.get(id);
  }
  takenHandles() {
    const taken = new Set;
    for (const record3 of this.agents.values()) {
      if (record3.handle)
        taken.add(record3.handle);
      if (record3.alias)
        taken.add(record3.alias);
    }
    for (const entry of this.tombstones.values()) {
      taken.add(entry.handle);
      if (entry.alias)
        taken.add(entry.alias);
    }
    return taken;
  }
  resolveMention(name) {
    const wanted = name.toLowerCase();
    let fallback;
    for (const record3 of this.agents.values()) {
      if (record3.parentAgentId !== undefined)
        continue;
      if (record3.handle?.toLowerCase() !== wanted && record3.alias?.toLowerCase() !== wanted)
        continue;
      if (record3.status === "running" || record3.status === "queued")
        return { kind: "live", record: record3 };
      if (!fallback || record3.startedAt > fallback.startedAt)
        fallback = record3;
    }
    if (fallback)
      return { kind: "live", record: fallback };
    const byId = this.agents.get(name);
    if (byId?.parentAgentId === undefined && byId !== undefined)
      return { kind: "live", record: byId };
    for (const entry of this.tombstones.values()) {
      if (entry.handle.toLowerCase() === wanted || entry.alias?.toLowerCase() === wanted || entry.id === name) {
        return { kind: "tombstone", entry };
      }
    }
    return;
  }
  dropTombstone(handle) {
    this.tombstones.delete(handle);
  }
  listTombstones() {
    return [...this.tombstones.values()].sort((a, b) => b.completedAt - a.completedAt);
  }
  listAgents() {
    return [...this.agents.values()].sort((a, b) => b.startedAt - a.startedAt);
  }
  abort(id) {
    const record3 = this.agents.get(id);
    if (!record3)
      return false;
    if (record3.status === "queued") {
      this.dequeue((q) => q.id === id);
      record3.status = "stopped";
      record3.completedAt = Date.now();
      return true;
    }
    if (record3.status !== "running")
      return false;
    record3.abortController?.abort();
    record3.status = "stopped";
    record3.completedAt = Date.now();
    return true;
  }
  removeRecord(id, record3) {
    this.tombstone(record3);
    const session = record3.session;
    record3.session = undefined;
    this.agents.delete(id);
    this.startups.delete(id);
    shutdownChildSession(session);
  }
  tombstone(record3) {
    if (!record3.handle || !record3.sessionFile)
      return;
    this.tombstones.set(record3.handle, {
      handle: record3.handle,
      alias: record3.alias,
      id: record3.id,
      type: record3.type,
      description: record3.description,
      sessionFile: record3.sessionFile,
      completedAt: record3.completedAt ?? Date.now()
    });
    while (this.tombstones.size > MAX_TOMBSTONES) {
      const oldest = [...this.tombstones.values()].reduce((a, b) => a.completedAt <= b.completedAt ? a : b);
      this.tombstones.delete(oldest.handle);
    }
  }
  cleanup() {
    const cutoff = Date.now() - 10 * 60000;
    for (const [id, record3] of this.agents) {
      if (record3.status === "running" || record3.status === "queued")
        continue;
      if ((record3.completedAt ?? 0) >= cutoff)
        continue;
      this.removeRecord(id, record3);
    }
  }
  clearCompleted(skipUnconsumed = false) {
    for (const [id, record3] of this.agents) {
      if (record3.status === "running" || record3.status === "queued")
        continue;
      if (skipUnconsumed && !record3.resultConsumed)
        continue;
      this.removeRecord(id, record3);
    }
    this.tombstones.clear();
  }
  hasRunning() {
    return [...this.agents.values()].some((r) => r.status === "running" || r.status === "queued");
  }
  abortAll() {
    let count = 0;
    for (const queued of this.queue) {
      const record3 = this.agents.get(queued.id);
      if (record3) {
        record3.status = "stopped";
        record3.completedAt = Date.now();
        count++;
      }
    }
    this.dequeue(() => true);
    for (const record3 of this.agents.values()) {
      if (record3.status === "running") {
        record3.abortController?.abort();
        record3.status = "stopped";
        record3.completedAt = Date.now();
        count++;
      }
    }
    return count;
  }
  async waitForAll() {
    while (true) {
      this.drainQueue();
      const pending = [];
      for (const record3 of this.agents.values()) {
        if (record3.status !== "running" && record3.status !== "queued")
          continue;
        const startup = this.startups.get(record3.id);
        if (startup)
          pending.push(startup);
        if (record3.promise)
          pending.push(record3.promise);
      }
      if (pending.length === 0)
        break;
      await Promise.allSettled(pending);
    }
  }
  async dispose(pi) {
    clearInterval(this.cleanupInterval);
    this.dequeue(() => true);
    const sessions = [...this.agents.values()].map((record3) => record3.session);
    this.agents.clear();
    this.startups.clear();
    if (pi) {
      const prune = (repo) => {
        pruneWorktrees(pi, repo).catch(() => {});
      };
      prune(process.cwd());
      for (const repo of this.worktreeRepos)
        prune(repo);
    }
    await Promise.all(sessions.map((session) => shutdownChildSession(session)));
  }
}
var DEFAULT_MAX_CONCURRENT = 10, DEFAULT_MAX_CONCURRENT_FOREGROUND = 0, MAX_TOMBSTONES = 100, CHILD_SHUTDOWN_TIMEOUT_MS = 3000;
var init_agent_manager = __esm(() => {
  init_agent_runner();
  init_mention();
  init_worktree();
});

// src/ui/agent-widget.ts
import { truncateToWidth } from "@earendil-works/pi-tui";
function fgPreservingNestedStyles(theme, color, text) {
  const styledEmpty = theme.fg(color, "");
  const styleStart = styledEmpty.replace(/\u001b\[(?:0|39)m/g, "");
  return theme.fg(color, text.replace(/\u001b\[(?:0|39)m/g, (reset) => `${reset}${styleStart}`));
}
function formatTokens(count) {
  if (count >= 1e6)
    return `${(count / 1e6).toFixed(1)}M token`;
  if (count >= 1000)
    return `${(count / 1000).toFixed(1)}k token`;
  return `${count} token`;
}
function formatCost(cost) {
  if (!(cost > 0))
    return "";
  if (cost < 0.0001)
    return "<$0.0001";
  if (cost >= 1)
    return `~$${cost.toFixed(2)}`;
  const rounded = Number(cost.toFixed(4));
  const decimals = (String(rounded).split(".")[1] ?? "").length;
  return `~$${rounded.toFixed(Math.max(2, decimals))}`;
}
function formatSessionTokens(tokens, percent, theme, compactions = 0) {
  const tokenStr = formatTokens(tokens);
  const annot = [];
  if (percent !== null) {
    const color = percent >= 85 ? "error" : percent >= 70 ? "warning" : "dim";
    annot.push(theme.fg(color, `${Math.round(percent)}%`));
  }
  if (compactions > 0) {
    annot.push(theme.fg("dim", `⇊${compactions}`));
  }
  if (annot.length === 0)
    return tokenStr;
  return `${tokenStr} (${annot.join(" · ")})`;
}
function formatTurns(turnCount, maxTurns) {
  return maxTurns != null ? `↻${turnCount}≤${maxTurns}` : `↻${turnCount}`;
}
function formatMs(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}
function formatDuration(startedAt, completedAt) {
  if (completedAt)
    return formatMs(completedAt - startedAt);
  return `${formatMs(Date.now() - startedAt)} (running)`;
}
function getDisplayName(type4) {
  return getConfig(type4).displayName;
}
function getPromptModeLabel(type4) {
  const config = getConfig(type4);
  return config.promptMode === "append" ? "twin" : undefined;
}
function buildInvocationTags(invocation) {
  const tags = [];
  if (!invocation)
    return { tags };
  const asked = (value2, requested) => value2 && requested && requested !== value2 ? `${value2} (asked ${requested})` : value2;
  const thinking = asked(invocation.thinking, invocation.requestedThinking);
  if (thinking)
    tags.push(`thinking: ${thinking}`);
  if (invocation.isolated)
    tags.push("isolated");
  if (invocation.isolation === "worktree")
    tags.push("worktree");
  if (invocation.inheritContext)
    tags.push("inherit context");
  if (invocation.runInBackground)
    tags.push("background");
  if (invocation.maxTurns != null)
    tags.push(`max turns: ${invocation.maxTurns}`);
  return {
    modelName: asked(invocation.modelName, invocation.requestedModel),
    modelId: asked(invocation.modelId, invocation.requestedModel),
    tags
  };
}
function truncateLine(text, len = 60) {
  const line = text.split(`
`).find((l) => l.trim())?.trim() ?? "";
  if (line.length <= len)
    return line;
  return line.slice(0, len) + "…";
}
function describeActivity(activeTools, responseText) {
  if (activeTools.size > 0) {
    const groups = new Map;
    for (const toolName of activeTools.values()) {
      const action = TOOL_DISPLAY[toolName] ?? toolName;
      groups.set(action, (groups.get(action) ?? 0) + 1);
    }
    const parts = [];
    for (const [action, count] of groups) {
      if (count > 1) {
        parts.push(`${action} ${count} ${action === "searching" ? "patterns" : "files"}`);
      } else {
        parts.push(action);
      }
    }
    return parts.join(", ") + "…";
  }
  if (responseText && responseText.trim().length > 0) {
    return truncateLine(responseText);
  }
  return "thinking…";
}

class AgentWidget {
  manager;
  agentActivity;
  mode;
  showCost;
  showModel;
  uiCtx;
  widgetFrame = 0;
  widgetInterval;
  finishedTurnAge = new Map;
  static ERROR_LINGER_TURNS = 2;
  widgetRegistered = false;
  tui;
  lastStatusText;
  constructor(manager, agentActivity, mode = () => "all", showCost = () => false, showModel = () => false) {
    this.manager = manager;
    this.agentActivity = agentActivity;
    this.mode = mode;
    this.showCost = showCost;
    this.showModel = showModel;
  }
  widgetAgents() {
    const all = this.manager.listAgents().filter(isTopLevelAgent);
    switch (this.mode()) {
      case "off":
        return [];
      case "background":
        return all.filter((a) => a.isBackground !== false);
      default:
        return all;
    }
  }
  setUICtx(ctx) {
    if (ctx !== this.uiCtx) {
      this.uiCtx = ctx;
      this.widgetRegistered = false;
      this.tui = undefined;
      this.lastStatusText = undefined;
    }
  }
  onTurnStart() {
    for (const [id, age] of this.finishedTurnAge) {
      this.finishedTurnAge.set(id, age + 1);
    }
    this.update();
  }
  ensureTimer() {
    if (!this.widgetInterval) {
      this.widgetInterval = setInterval(() => this.update(), 80);
    }
  }
  shouldShowFinished(agentId, status) {
    const age = this.finishedTurnAge.get(agentId) ?? 0;
    const maxAge = ERROR_STATUSES.has(status) ? AgentWidget.ERROR_LINGER_TURNS : 1;
    return age < maxAge;
  }
  markFinished(agentId) {
    if (!this.finishedTurnAge.has(agentId)) {
      this.finishedTurnAge.set(agentId, 0);
    }
  }
  markRunning(agentId) {
    this.finishedTurnAge.delete(agentId);
  }
  renderFinishedLine(a, theme) {
    const modeLabel = getPromptModeLabel(a.type);
    const duration = formatMs((a.completedAt ?? Date.now()) - a.startedAt);
    let icon;
    let statusText;
    if (a.status === "completed") {
      icon = theme.fg("success", "✓");
      statusText = "";
    } else if (a.status === "steered") {
      icon = theme.fg("warning", "✓");
      statusText = theme.fg("warning", " (turn limit)");
    } else if (a.status === "stopped") {
      icon = theme.fg("dim", "■");
      statusText = theme.fg("dim", " stopped");
    } else if (a.status === "error") {
      icon = theme.fg("error", "✗");
      const errMsg = a.error ? `: ${a.error.slice(0, 60)}` : "";
      statusText = theme.fg("error", ` error${errMsg}`);
    } else {
      icon = theme.fg("error", "✗");
      statusText = theme.fg("warning", " aborted");
    }
    const parts = [];
    const activity = this.agentActivity.get(a.id);
    if (activity)
      parts.push(formatTurns(activity.turnCount, activity.maxTurns));
    if (a.toolUses > 0)
      parts.push(`${a.toolUses} tool use${a.toolUses === 1 ? "" : "s"}`);
    const costText = this.showCost() ? formatCost(getLifetimeCost(a.lifetimeUsage)) : "";
    if (costText)
      parts.push(costText);
    parts.push(duration);
    const modeTag = modeLabel ? ` ${theme.fg("dim", `(${modeLabel})`)}` : "";
    return `${icon} ${renderAgentName(a.type, theme, { fallbackColor: "dim" })}${modeTag}  ${theme.fg("dim", a.description)} ${theme.fg("dim", "·")} ${theme.fg("dim", parts.join(" · "))}${statusText}`;
  }
  renderWidget(tui, theme) {
    const allAgents = this.widgetAgents();
    const running = allAgents.filter((a) => a.status === "running");
    const queued = allAgents.filter((a) => a.status === "queued");
    const finished = allAgents.filter((a) => a.status !== "running" && a.status !== "queued" && a.completedAt && this.shouldShowFinished(a.id, a.status));
    const hasActive = running.length > 0 || queued.length > 0;
    const hasFinished = finished.length > 0;
    if (!hasActive && !hasFinished)
      return [];
    const w2 = tui.terminal.columns;
    const truncate = (line) => truncateToWidth(line, w2);
    const headingColor = hasActive ? "accent" : "dim";
    const headingIcon = hasActive ? "●" : "○";
    const frame = SPINNER[this.widgetFrame % SPINNER.length];
    const finishedLines = [];
    for (const a of finished) {
      finishedLines.push(truncate(theme.fg("dim", "├─") + " " + this.renderFinishedLine(a, theme)));
    }
    const runningLines = [];
    for (const a of running) {
      const modeLabel = getPromptModeLabel(a.type);
      const modeTag = modeLabel ? ` ${theme.fg("dim", `(${modeLabel})`)}` : "";
      const elapsed = formatMs(Date.now() - a.startedAt);
      const bg = this.agentActivity.get(a.id);
      const toolUses = bg?.toolUses ?? a.toolUses;
      const tokens = getLifetimeTotal(a.lifetimeUsage);
      const contextPercent = getSessionContextPercent(bg?.session);
      const tokenText = tokens > 0 ? formatSessionTokens(tokens, contextPercent, theme, a.compactionCount) : "";
      const costText = this.showCost() ? formatCost(getLifetimeCost(a.lifetimeUsage)) : "";
      const parts = [];
      if (this.showModel()) {
        const { modelName, tags } = buildInvocationTags(a.invocation);
        if (modelName)
          parts.push(modelName);
        const thinkingTag = tags.find((tag) => tag.startsWith("thinking: "));
        if (thinkingTag)
          parts.push(thinkingTag);
      }
      if (bg)
        parts.push(formatTurns(bg.turnCount, bg.maxTurns));
      if (toolUses > 0)
        parts.push(`${toolUses} tool use${toolUses === 1 ? "" : "s"}`);
      if (tokenText)
        parts.push(tokenText);
      if (costText)
        parts.push(costText);
      parts.push(elapsed);
      const statsText = parts.join(" · ");
      const activity = bg ? describeActivity(bg.activeTools, bg.responseText) : "thinking…";
      runningLines.push([
        truncate(theme.fg("dim", "├─") + ` ${theme.fg("accent", frame)} ${renderAgentName(a.type, theme, { bold: true })}${modeTag}  ${theme.fg("muted", a.description)} ${theme.fg("dim", "·")} ${fgPreservingNestedStyles(theme, "dim", statsText)}`),
        truncate(theme.fg("dim", "│  ") + theme.fg("dim", `  ⎿  ${activity}`))
      ]);
    }
    const queuedLine = queued.length > 0 ? truncate(theme.fg("dim", "├─") + ` ${theme.fg("muted", "◦")} ${theme.fg("dim", `${queued.length} queued`)}`) : undefined;
    const maxBody = MAX_WIDGET_LINES - 1;
    const totalBody = finishedLines.length + runningLines.length * 2 + (queuedLine ? 1 : 0);
    const lines = [truncate(theme.fg(headingColor, headingIcon) + " " + theme.fg(headingColor, "Agents"))];
    if (totalBody <= maxBody) {
      lines.push(...finishedLines);
      for (const pair of runningLines)
        lines.push(...pair);
      if (queuedLine)
        lines.push(queuedLine);
      if (lines.length > 1) {
        const last = lines.length - 1;
        lines[last] = lines[last].replace("├─", "└─");
        if (runningLines.length > 0 && !queuedLine) {
          if (last >= 2) {
            lines[last - 1] = lines[last - 1].replace("├─", "└─");
            lines[last] = lines[last].replace("│  ", "   ");
          }
        }
      }
    } else {
      let budget = maxBody - 1;
      let hiddenRunning = 0;
      let hiddenFinished = 0;
      const queuedReserve = queuedLine ? 1 : 0;
      budget -= queuedReserve;
      for (const pair of runningLines) {
        if (budget >= 2) {
          lines.push(...pair);
          budget -= 2;
        } else {
          hiddenRunning++;
        }
      }
      if (queuedLine) {
        budget += queuedReserve;
        lines.push(queuedLine);
        budget--;
      }
      for (const fl of finishedLines) {
        if (budget >= 1) {
          lines.push(fl);
          budget--;
        } else {
          hiddenFinished++;
        }
      }
      const overflowParts = [];
      if (hiddenRunning > 0)
        overflowParts.push(`${hiddenRunning} running`);
      if (hiddenFinished > 0)
        overflowParts.push(`${hiddenFinished} finished`);
      const overflowText = overflowParts.join(", ");
      lines.push(truncate(theme.fg("dim", "└─") + ` ${theme.fg("dim", `+${hiddenRunning + hiddenFinished} more (${overflowText})`)}`));
    }
    return lines;
  }
  update() {
    if (!this.uiCtx)
      return;
    const allAgents = this.widgetAgents();
    let runningCount = 0;
    let queuedCount = 0;
    let hasFinished = false;
    for (const a of allAgents) {
      if (a.status === "running") {
        runningCount++;
      } else if (a.status === "queued") {
        queuedCount++;
      } else if (a.completedAt && this.shouldShowFinished(a.id, a.status)) {
        hasFinished = true;
      }
    }
    const hasActive = runningCount > 0 || queuedCount > 0;
    if (!hasActive && !hasFinished) {
      if (this.widgetRegistered) {
        this.uiCtx.setWidget("agents", undefined);
        this.widgetRegistered = false;
        this.tui = undefined;
      }
      if (this.lastStatusText !== undefined) {
        this.uiCtx.setStatus("subagents", undefined);
        this.lastStatusText = undefined;
      }
      if (this.widgetInterval) {
        clearInterval(this.widgetInterval);
        this.widgetInterval = undefined;
      }
      for (const [id] of this.finishedTurnAge) {
        if (!allAgents.some((a) => a.id === id))
          this.finishedTurnAge.delete(id);
      }
      return;
    }
    let newStatusText;
    if (hasActive) {
      const statusParts = [];
      if (runningCount > 0)
        statusParts.push(`${runningCount} running`);
      if (queuedCount > 0)
        statusParts.push(`${queuedCount} queued`);
      const total = runningCount + queuedCount;
      newStatusText = `${statusParts.join(", ")} agent${total === 1 ? "" : "s"}`;
    }
    if (newStatusText !== this.lastStatusText) {
      this.uiCtx.setStatus("subagents", newStatusText);
      this.lastStatusText = newStatusText;
    }
    this.widgetFrame++;
    if (!this.widgetRegistered) {
      this.uiCtx.setWidget("agents", (tui, theme) => {
        this.tui = tui;
        return {
          render: () => this.renderWidget(tui, theme),
          invalidate: () => {
            this.widgetRegistered = false;
            this.tui = undefined;
          }
        };
      }, { placement: "aboveEditor" });
      this.widgetRegistered = true;
    } else {
      this.tui?.requestRender();
    }
  }
  dispose() {
    if (this.widgetInterval) {
      clearInterval(this.widgetInterval);
      this.widgetInterval = undefined;
    }
    if (this.uiCtx) {
      this.uiCtx.setWidget("agents", undefined);
      this.uiCtx.setStatus("subagents", undefined);
    }
    this.widgetRegistered = false;
    this.tui = undefined;
    this.lastStatusText = undefined;
  }
}
var MAX_WIDGET_LINES = 12, SPINNER, ERROR_STATUSES, TOOL_DISPLAY;
var init_agent_widget = __esm(() => {
  init_agent_color();
  init_agent_manager();
  init_agent_types();
  SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  ERROR_STATUSES = new Set(["error", "aborted", "steered", "stopped"]);
  TOOL_DISPLAY = {
    read: "reading",
    bash: "running command",
    edit: "editing",
    write: "writing",
    grep: "searching",
    find: "finding files",
    ls: "listing"
  };
});

// src/ui/viewer-keys.ts
import { matchesKey } from "@earendil-works/pi-tui";
function createViewerKeys(keybindings) {
  const matches = (data, id, fallback) => keybindings ? keybindings.matches(data, id) : matchesKey(data, fallback);
  return {
    scrollUp: (data) => matches(data, "tui.select.up", "up") || matchesKey(data, "k"),
    scrollDown: (data) => matches(data, "tui.select.down", "down") || matchesKey(data, "j"),
    pageUp: (data) => matches(data, "tui.select.pageUp", "pageUp") || matchesKey(data, "shift+up"),
    pageDown: (data) => matches(data, "tui.select.pageDown", "pageDown") || matchesKey(data, "shift+down")
  };
}
var init_viewer_keys = () => {};

// src/ui/conversation-viewer.ts
var exports_conversation_viewer = {};
__export(exports_conversation_viewer, {
  VIEWPORT_HEIGHT_PCT: () => VIEWPORT_HEIGHT_PCT,
  RESULT_MAX_CHARS: () => RESULT_MAX_CHARS,
  ConversationViewer: () => ConversationViewer
});
import { getMarkdownTheme } from "@earendil-works/pi-coding-agent";
import { Input, Markdown, matchesKey as matchesKey2, truncateToWidth as truncateToWidth2, visibleWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";
function resolveMarkdownTheme(th) {
  try {
    const piTheme = getMarkdownTheme();
    piTheme.heading("probe");
    return piTheme;
  } catch {
    return fallbackMarkdownTheme(th);
  }
}
function fallbackMarkdownTheme(th) {
  const sgr = (on, off) => (text) => `\x1B[${on}m${text}\x1B[${off}m`;
  return {
    heading: (text) => th.bold(th.fg("accent", text)),
    link: (text) => th.fg("accent", text),
    linkUrl: (text) => th.fg("muted", text),
    code: (text) => th.fg("muted", text),
    codeBlock: (text) => th.fg("muted", text),
    codeBlockBorder: (text) => th.fg("dim", text),
    quote: (text) => th.fg("muted", text),
    quoteBorder: (text) => th.fg("dim", text),
    hr: (text) => th.fg("dim", text),
    listBullet: (text) => th.fg("accent", text),
    bold: (text) => th.bold(text),
    italic: sgr(3, 23),
    underline: sgr(4, 24),
    strikethrough: sgr(9, 29)
  };
}
function capResult(text) {
  if (text.length <= RESULT_MAX_CHARS)
    return { text, elided: 0 };
  return {
    text: text.slice(0, RESULT_MAX_CHARS),
    elided: text.length - RESULT_MAX_CHARS
  };
}
function humanCount(n) {
  if (n < 1000)
    return `${n}`;
  const thousands = n < 999950;
  const value2 = thousands ? n / 1000 : n / 1e6;
  return `${value2.toFixed(1).replace(/\.0$/, "")}${thousands ? "k" : "M"}`;
}
function truncationNote(elided) {
  return `... (truncated, ${humanCount(elided)} more character${elided === 1 ? "" : "s"})`;
}

class ConversationViewer {
  tui;
  session;
  record;
  activity;
  theme;
  done;
  onStop;
  onSteer;
  showCost;
  viewerMarkdown;
  onMarkdownMode;
  scrollOffset = 0;
  autoScroll = true;
  unsubscribe;
  lastInnerW = 0;
  closed = false;
  stopArmed = false;
  keys;
  composer;
  markdownTheme;
  markdownModeOverride;
  markdownCache = new WeakMap;
  constructor(tui, session, record3, activity, theme, done, onStop, keybindings, onSteer, showCost = false, viewerMarkdown, onMarkdownMode) {
    this.tui = tui;
    this.session = session;
    this.record = record3;
    this.activity = activity;
    this.theme = theme;
    this.done = done;
    this.onStop = onStop;
    this.onSteer = onSteer;
    this.showCost = showCost;
    this.viewerMarkdown = viewerMarkdown;
    this.onMarkdownMode = onMarkdownMode;
    this.markdownTheme = resolveMarkdownTheme(theme);
    this.keys = createViewerKeys(keybindings);
    this.unsubscribe = session.subscribe(() => {
      if (this.closed)
        return;
      this.tui.requestRender();
    });
  }
  handleInput(data) {
    if (this.composer) {
      this.composer.handleInput(data);
      this.tui.requestRender();
      return;
    }
    if (matchesKey2(data, "escape") || matchesKey2(data, "ctrl+c") || matchesKey2(data, "q")) {
      this.closed = true;
      this.done(undefined);
      return;
    }
    if (matchesKey2(data, "enter") && this.canSteer()) {
      this.stopArmed = false;
      this.openComposer();
      return;
    }
    if (matchesKey2(data, "x")) {
      if (this.isStoppable()) {
        if (this.stopArmed) {
          this.stopArmed = false;
          this.onStop?.();
        } else {
          this.stopArmed = true;
        }
        this.tui.requestRender();
      }
      return;
    }
    if (matchesKey2(data, "m")) {
      this.stopArmed = false;
      const next = MARKDOWN_MODES[(MARKDOWN_MODES.indexOf(this.markdownMode()) + 1) % MARKDOWN_MODES.length];
      this.markdownModeOverride = next;
      this.onMarkdownMode?.(next);
      this.tui.requestRender();
      return;
    }
    if (this.stopArmed)
      this.stopArmed = false;
    const totalLines = this.buildContentLines(this.lastInnerW).length;
    const viewportHeight = this.viewportHeight();
    const maxScroll = Math.max(0, totalLines - viewportHeight);
    if (this.keys.scrollUp(data)) {
      this.scrollOffset = Math.max(0, this.scrollOffset - 1);
      this.autoScroll = this.scrollOffset >= maxScroll;
    } else if (this.keys.scrollDown(data)) {
      this.scrollOffset = Math.min(maxScroll, this.scrollOffset + 1);
      this.autoScroll = this.scrollOffset >= maxScroll;
    } else if (this.keys.pageUp(data)) {
      this.scrollOffset = Math.max(0, this.scrollOffset - viewportHeight);
      this.autoScroll = false;
    } else if (this.keys.pageDown(data)) {
      this.scrollOffset = Math.min(maxScroll, this.scrollOffset + viewportHeight);
      this.autoScroll = this.scrollOffset >= maxScroll;
    } else if (matchesKey2(data, "home")) {
      this.scrollOffset = 0;
      this.autoScroll = false;
    } else if (matchesKey2(data, "end")) {
      this.scrollOffset = maxScroll;
      this.autoScroll = true;
    }
  }
  render(width) {
    if (width < 6)
      return [];
    const th = this.theme;
    const innerW = width - 4;
    this.lastInnerW = innerW;
    const lines = [];
    const pad = (s2, len) => {
      const vis = visibleWidth(s2);
      return s2 + " ".repeat(Math.max(0, len - vis));
    };
    const row = (content) => th.fg("border", "│") + " " + truncateToWidth2(pad(content, innerW), innerW, "...", true) + " " + th.fg("border", "│");
    const hrTop = th.fg("border", `╭${"─".repeat(width - 2)}╮`);
    const hrBot = th.fg("border", `╰${"─".repeat(width - 2)}╯`);
    const hrMid = row(th.fg("dim", "─".repeat(innerW)));
    lines.push(hrTop);
    const modeLabel = getPromptModeLabel(this.record.type);
    const modeTag = modeLabel ? ` ${th.fg("dim", `(${modeLabel})`)}` : "";
    const statusIcon = this.record.status === "running" ? th.fg("accent", "●") : this.record.status === "completed" ? th.fg("success", "✓") : this.record.status === "error" ? th.fg("error", "✗") : th.fg("dim", "○");
    const duration = formatDuration(this.record.startedAt, this.record.completedAt);
    const headerParts = [duration];
    const toolUses = this.activity?.toolUses ?? this.record.toolUses;
    if (toolUses > 0)
      headerParts.unshift(`${toolUses} tool${toolUses === 1 ? "" : "s"}`);
    const tokens = getLifetimeTotal(this.record.lifetimeUsage);
    if (tokens > 0) {
      const percent = getSessionContextPercent(this.activity?.session);
      headerParts.push(formatSessionTokens(tokens, percent, th, this.record.compactionCount));
    }
    const cost = this.showCost ? formatCost(getLifetimeCost(this.record.lifetimeUsage)) : "";
    if (cost)
      headerParts.push(cost);
    lines.push(row(`${statusIcon} ${renderAgentName(this.record.type, th, { bold: true })}${modeTag}  ${th.fg("muted", this.record.description)} ${th.fg("dim", "·")} ${fgPreservingNestedStyles(th, "dim", headerParts.join(" · "))}`));
    const invocationLine = this.invocationLine();
    if (invocationLine)
      lines.push(row(invocationLine));
    lines.push(hrMid);
    const contentLines = this.buildContentLines(innerW);
    const viewportHeight = this.viewportHeight();
    const maxScroll = Math.max(0, contentLines.length - viewportHeight);
    if (this.autoScroll) {
      this.scrollOffset = maxScroll;
    }
    const visibleStart = Math.min(this.scrollOffset, maxScroll);
    const visible = contentLines.slice(visibleStart, visibleStart + viewportHeight);
    for (let i = 0;i < viewportHeight; i++) {
      lines.push(row(visible[i] ?? ""));
    }
    lines.push(hrMid);
    if (this.composer) {
      lines.push(row(this.composer.render(innerW)[0] ?? ""));
      const composeHint = th.fg("dim", "Enter send · Esc cancel");
      const composeLeft = th.fg("accent", "✎ steer");
      const composeGap = Math.max(1, innerW - visibleWidth(composeLeft) - visibleWidth(composeHint));
      lines.push(row(composeLeft + " ".repeat(composeGap) + composeHint));
    } else {
      const sep2 = th.fg("dim", " · ");
      const actions = [];
      if (this.canSteer())
        actions.push(th.fg("dim", "Enter steer"));
      if (this.isStoppable()) {
        actions.push(this.stopArmed ? th.fg("error", "x again to STOP") : th.fg("dim", "x stop"));
      }
      actions.push(th.fg("dim", `m ${MARKDOWN_MODE_LABELS[this.markdownMode()]}`));
      const footerRight = th.fg("dim", "↑↓ scroll · PgUp/PgDn or Shift+↑↓ · Esc close");
      const scrollPct = contentLines.length <= viewportHeight ? "100%" : `${Math.round((visibleStart + viewportHeight) / contentLines.length * 100)}%`;
      const count = th.fg("dim", `${contentLines.length} lines · ${scrollPct}`);
      const withCount = [count, ...actions].join(sep2);
      const footerLeft = visibleWidth(withCount) + visibleWidth(footerRight) + 1 <= innerW ? withCount : actions.join(sep2);
      const footerGap = Math.max(1, innerW - visibleWidth(footerLeft) - visibleWidth(footerRight));
      lines.push(row(footerLeft + " ".repeat(footerGap) + footerRight));
    }
    lines.push(hrBot);
    return lines;
  }
  isStoppable() {
    return !!this.onStop && (this.record.status === "running" || this.record.status === "queued");
  }
  markdownMode() {
    return this.markdownModeOverride ?? this.viewerMarkdown?.() ?? "assistant";
  }
  rawLines(text, width, dim) {
    const lines = wrapTextWithAnsi(text, width);
    return dim ? lines.map((l) => this.theme.fg("dim", l)) : lines;
  }
  markdownLines(msg, text, width, dim) {
    let entry = this.markdownCache.get(msg);
    if (!entry) {
      entry = {
        md: new Markdown(text, 0, 0, this.markdownTheme, dim ? { color: (t) => this.theme.fg("dim", t) } : undefined, MARKDOWN_OPTIONS),
        text
      };
      this.markdownCache.set(msg, entry);
    } else if (entry.text !== text) {
      const shouldRetry = !text.startsWith(entry.text);
      entry.md.setText(text);
      entry.text = text;
      if (shouldRetry)
        entry.failed = false;
    }
    if (entry.failed)
      return this.rawLines(text, width, dim);
    try {
      return entry.md.render(width);
    } catch {
      entry.failed = true;
      return this.rawLines(text, width, dim);
    }
  }
  canSteer() {
    return !!this.onSteer && (this.record.status === "running" || this.record.status === "queued");
  }
  openComposer() {
    const input = new Input;
    input.focused = true;
    input.onSubmit = (value2) => {
      const message = value2.trim();
      this.composer = undefined;
      if (message)
        this.onSteer?.(message);
      this.tui.requestRender();
    };
    input.onEscape = () => {
      this.composer = undefined;
      this.tui.requestRender();
    };
    this.composer = input;
    this.tui.requestRender();
  }
  invalidate() {}
  dispose() {
    this.closed = true;
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }
  viewportHeight() {
    const maxRows = Math.floor(this.tui.terminal.rows * VIEWPORT_HEIGHT_PCT / 100);
    return Math.max(MIN_VIEWPORT, maxRows - this.chromeLines());
  }
  chromeLines() {
    return CHROME_LINES_BASE + (this.invocationLine() ? 1 : 0) + (this.composer ? 1 : 0);
  }
  invocationLine() {
    const { modelName, modelId, tags } = buildInvocationTags(this.record.invocation);
    const model = modelId ?? modelName;
    const parts = model ? [model, ...tags] : tags;
    if (parts.length === 0)
      return;
    return this.theme.fg("dim", `  ↳ ${parts.join(" · ")}`);
  }
  buildContentLines(width) {
    if (width <= 0)
      return [];
    const th = this.theme;
    const messages = this.session.messages;
    const lines = [];
    if (messages.length === 0) {
      lines.push(th.fg("dim", "(waiting for first message...)"));
      return lines;
    }
    const mode = this.markdownMode();
    let needsSeparator = false;
    for (const msg of messages) {
      if (msg.role === "user") {
        const text = typeof msg.content === "string" ? msg.content : extractText(msg.content);
        if (!text.trim())
          continue;
        if (needsSeparator)
          lines.push(th.fg("dim", "───"));
        lines.push(th.fg("accent", "[User]"));
        for (const line of wrapTextWithAnsi(text.trim(), width)) {
          lines.push(line);
        }
      } else if (msg.role === "assistant") {
        const textParts = [];
        const toolCalls = [];
        for (const c of msg.content) {
          if (c.type === "text" && c.text)
            textParts.push(c.text);
          else if (c.type === "toolCall") {
            toolCalls.push(c.name ?? c.toolName ?? "unknown");
          }
        }
        if (needsSeparator)
          lines.push(th.fg("dim", "───"));
        lines.push(th.bold("[Assistant]"));
        if (textParts.length > 0) {
          const text = textParts.join(`
`).trim();
          lines.push(...mode === "off" ? this.rawLines(text, width, false) : this.markdownLines(msg, text, width, false));
        }
        for (const name of toolCalls) {
          lines.push(truncateToWidth2(th.fg("muted", `  [Tool: ${name}]`), width));
        }
      } else if (msg.role === "toolResult") {
        const { text, elided } = capResult(extractText(msg.content).trim());
        if (!text)
          continue;
        if (needsSeparator)
          lines.push(th.fg("dim", "───"));
        lines.push(th.fg("dim", "[Result]"));
        lines.push(...mode === "all" ? this.markdownLines(msg, text, width, true) : this.rawLines(text, width, true));
        if (elided)
          lines.push(truncateToWidth2(th.fg("dim", truncationNote(elided)), width));
      } else if (msg.role === "bashExecution") {
        const bash = msg;
        if (needsSeparator)
          lines.push(th.fg("dim", "───"));
        lines.push(truncateToWidth2(th.fg("muted", `  $ ${bash.command}`), width));
        if (bash.output?.trim()) {
          const { text, elided } = capResult(bash.output.trim());
          lines.push(...this.rawLines(text, width, true));
          if (elided)
            lines.push(truncateToWidth2(th.fg("dim", truncationNote(elided)), width));
        }
      } else {
        continue;
      }
      needsSeparator = true;
    }
    if (this.record.status === "running" && this.activity) {
      const act = describeActivity(this.activity.activeTools, this.activity.responseText);
      lines.push("");
      lines.push(truncateToWidth2(th.fg("accent", "▍ ") + th.fg("dim", act), width));
    }
    return lines.map((l) => truncateToWidth2(l, width));
  }
}
var CHROME_LINES_BASE = 6, MIN_VIEWPORT = 3, VIEWPORT_HEIGHT_PCT = 70, RESULT_MAX_CHARS = 16000, MARKDOWN_MODES, MARKDOWN_MODE_LABELS, MARKDOWN_OPTIONS;
var init_conversation_viewer = __esm(() => {
  init_agent_color();
  init_agent_widget();
  init_viewer_keys();
  MARKDOWN_MODES = ["off", "assistant", "all"];
  MARKDOWN_MODE_LABELS = {
    off: "raw",
    assistant: "md",
    all: "md+"
  };
  MARKDOWN_OPTIONS = {
    preserveOrderedListMarkers: true,
    preserveBackslashEscapes: true
  };
});

// src/index.ts
init_esm();
init_agent_color();
import { existsSync as existsSync11, mkdirSync as mkdirSync5, readFileSync as readFileSync9, unlinkSync as unlinkSync2, writeFileSync as writeFileSync4 } from "node:fs";
import { isAbsolute as isAbsolute4, join as join12 } from "node:path";
import { defineTool as defineTool3, getAgentDir as getAgentDir9, getSettingsListTheme } from "@earendil-works/pi-coding-agent";
import { Container, Key as Key2, matchesKey as matchesKey5, SettingsList, Spacer, Text as Text2 } from "@earendil-works/pi-tui";

// src/agent-file-toggle.ts
init_custom_agents();
import { existsSync as existsSync2 } from "node:fs";
import { join as join2, sep } from "node:path";
import { getAgentDir as getAgentDir2 } from "@earendil-works/pi-coding-agent";
var projectAgentsDir = (cwd = process.cwd()) => join2(cwd, ".pi", "agents");
var workspaceAgentsDir = (cwd = process.cwd()) => join2(cwd, ".agents", "agents");
var personalAgentsDir = () => join2(getAgentDir2(), "agents");
function findAgentFile(name, cwd = process.cwd()) {
  const projectPath = join2(projectAgentsDir(cwd), `${name}.md`);
  if (existsSync2(projectPath))
    return { path: projectPath, location: "project" };
  const workspacePath = join2(workspaceAgentsDir(cwd), `${name}.md`);
  if (existsSync2(workspacePath))
    return { path: workspacePath, location: "workspace" };
  const personalPath = join2(personalAgentsDir(), `${name}.md`);
  if (existsSync2(personalPath))
    return { path: personalPath, location: "personal" };
  return;
}
function locateAgentFile(name, sourcePath, cwd = process.cwd()) {
  if (sourcePath && existsSync2(sourcePath)) {
    return { path: sourcePath, location: classifyAgentDir(sourcePath, cwd) };
  }
  return findAgentFile(name, cwd);
}
function classifyAgentDir(path, cwd) {
  if (path.startsWith(projectAgentsDir(cwd) + sep))
    return "project";
  if (path.startsWith(workspaceAgentsDir(cwd) + sep))
    return "workspace";
  return "personal";
}
var ENABLED_FALSE = /^enabled:[ \t]*false[ \t]*$/;
var FENCE = /^---[ \t]*$/;
function splitFrontmatter(content) {
  const lines = content.split(/(?<=\n)/);
  if (lines.length === 0)
    return;
  const bom = content.startsWith("\uFEFF");
  const first = (bom ? lines[0].slice(1) : lines[0]).replace(/\r?\n$/, "");
  if (!FENCE.test(first))
    return;
  const closeIdx = lines.findIndex((l, i) => i > 0 && FENCE.test(l.replace(/\r?\n$/, "")));
  if (closeIdx === -1)
    return;
  return { lines, openIdx: 0, closeIdx, eol: lines[0].endsWith(`\r
`) ? `\r
` : `
` };
}
function isDisabledContent(content) {
  try {
    return parseAgentFrontmatter(content).frontmatter.enabled === false;
  } catch {
    return false;
  }
}
function disableInContent(content) {
  const block = splitFrontmatter(content);
  if (!block)
    return { content, outcome: "no-frontmatter" };
  if (isDisabledContent(content))
    return { content, outcome: "already-disabled" };
  const lines = [...block.lines];
  lines.splice(1, 0, `enabled: false${block.eol}`);
  return { content: lines.join(""), outcome: "disabled" };
}
function enableInContent(content) {
  const block = splitFrontmatter(content);
  if (!block)
    return { content, changed: false };
  const kept = block.lines.filter((l, i) => !(i > 0 && i < block.closeIdx && ENABLED_FALSE.test(l.replace(/\r?\n$/, ""))));
  if (kept.length === block.lines.length)
    return { content, changed: false };
  return { content: kept.join(""), changed: true };
}
function isEmptyStub(content) {
  return content.replace(/\r\n/g, `
`).trim() === `---
---`;
}
function buildNewAgentFile(input) {
  const modelLine = input.model ? `
model: ${JSON.stringify(input.model)}` : "";
  const thinkingLine = input.thinking ? `
thinking: ${input.thinking}` : "";
  return `---
description: ${JSON.stringify(input.description)}
tools: ${input.tools}${modelLine}${thinkingLine}
prompt_mode: replace
---

${input.systemPrompt}
`;
}
function formatToolsField(tools) {
  if (tools === undefined)
    return "all";
  if (tools.length === 0)
    return "none";
  return tools.join(", ");
}
function serializeAgentFile(cfg) {
  const fmFields = [];
  fmFields.push(`description: ${JSON.stringify(cfg.description)}`);
  if (cfg.displayName)
    fmFields.push(`display_name: ${cfg.displayName}`);
  if (cfg.color)
    fmFields.push(`color: ${JSON.stringify(cfg.color)}`);
  fmFields.push(`tools: ${formatToolsField(cfg.builtinToolNames)}`);
  if (cfg.model)
    fmFields.push(`model: ${cfg.model}`);
  if (cfg.thinking)
    fmFields.push(`thinking: ${cfg.thinking}`);
  if (cfg.maxTurns)
    fmFields.push(`max_turns: ${cfg.maxTurns}`);
  if (cfg.allowedSubagents !== undefined) {
    fmFields.push(`allowed_subagents: ${cfg.allowedSubagents === "all" ? "all" : cfg.allowedSubagents.join(", ")}`);
  }
  fmFields.push(`prompt_mode: ${cfg.promptMode}`);
  if (cfg.extensions === false)
    fmFields.push("extensions: false");
  else if (Array.isArray(cfg.extensions))
    fmFields.push(`extensions: ${cfg.extensions.join(", ")}`);
  if (cfg.excludeExtensions?.length)
    fmFields.push(`exclude_extensions: ${cfg.excludeExtensions.join(", ")}`);
  if (cfg.skills === false)
    fmFields.push("skills: false");
  else if (Array.isArray(cfg.skills))
    fmFields.push(`skills: ${cfg.skills.join(", ")}`);
  if (cfg.disallowedTools?.length)
    fmFields.push(`disallowed_tools: ${cfg.disallowedTools.join(", ")}`);
  if (cfg.inheritContext)
    fmFields.push("inherit_context: true");
  if (cfg.runInBackground !== undefined)
    fmFields.push(`run_in_background: ${cfg.runInBackground}`);
  if (cfg.outputTranscript === false)
    fmFields.push("output_transcript: false");
  if (cfg.isolated)
    fmFields.push("isolated: true");
  if (cfg.memory)
    fmFields.push(`memory: ${cfg.memory}`);
  if (cfg.isolation)
    fmFields.push(`isolation: ${cfg.isolation}`);
  return `---
${fmFields.join(`
`)}
---

${cfg.systemPrompt}
`;
}

// src/index.ts
init_agent_manager();
init_agent_runner();
init_agent_types();
init_child_context();

// src/cross-extension-rpc.ts
init_agent_manager();
init_model_scope();
var PROTOCOL_VERSION = 2;
function handleRpc(events, channel, fn) {
  return events.on(channel, async (raw) => {
    const params = raw;
    try {
      const data = await fn(params);
      const reply = { success: true };
      if (data !== undefined)
        reply.data = data;
      events.emit(`${channel}:reply:${params.requestId}`, reply);
    } catch (err) {
      events.emit(`${channel}:reply:${params.requestId}`, {
        success: false,
        error: err?.message ?? String(err)
      });
    }
  });
}
function registerRpcHandlers(deps) {
  const { events, pi, getCtx, manager } = deps;
  const unsubPing = handleRpc(events, "subagents:rpc:ping", () => {
    return { version: PROTOCOL_VERSION };
  });
  const unsubSpawn = handleRpc(events, "subagents:rpc:spawn", async ({ type: type4, prompt, options }) => {
    const ctx = getCtx();
    if (!ctx)
      throw new Error("No active session");
    let normalizedOptions = options ?? {};
    const override = normalizedOptions.model;
    if (override != null) {
      const { modelRegistry, cwd } = ctx;
      const label = typeof override === "string" ? override : `${override.provider}/${override.id}`;
      if (!modelRegistry) {
        throw new Error(`Model override "${label}" provided but ctx.modelRegistry is unavailable`);
      }
      let model = override;
      if (typeof override === "string") {
        const resolved = resolveModel(override, modelRegistry);
        if (typeof resolved === "string") {
          throw new Error(resolved);
        }
        model = resolved;
        normalizedOptions = { ...normalizedOptions, model: resolved };
      }
      const verdict = checkModelScope({
        model,
        cwd: cwd ?? process.cwd(),
        modelRegistry,
        callerSupplied: true,
        agentLabel: type4,
        modelInput: label
      });
      if (verdict.kind === "error")
        throw new Error(verdict.message);
    }
    const id = manager.spawn(pi, ctx, type4, prompt, normalizedOptions);
    await manager.awaitStartup(id);
    return { id };
  });
  const unsubStop = handleRpc(events, "subagents:rpc:stop", ({ agentId }) => {
    const record3 = manager.getRecord(agentId);
    if (!record3)
      throw new Error("Agent not found");
    if (!isTopLevelAgent(record3))
      throw new Error("Agent is owned by another agent or workflow");
    if (!manager.abort(agentId))
      throw new Error("Agent is not running");
  });
  const unsubConsume = handleRpc(events, "subagents:rpc:consume", ({ agentId }) => {
    if (!manager.consumeResult(agentId))
      throw new Error("Agent not found or still running");
  });
  return { unsubPing, unsubSpawn, unsubStop, unsubConsume };
}

// src/index.ts
init_custom_agents();

// src/group-join.ts
var DEFAULT_TIMEOUT = 30000;
var STRAGGLER_TIMEOUT = 15000;

class GroupJoinManager {
  deliverCb;
  groupTimeout;
  groups = new Map;
  agentToGroup = new Map;
  constructor(deliverCb, groupTimeout = DEFAULT_TIMEOUT) {
    this.deliverCb = deliverCb;
    this.groupTimeout = groupTimeout;
  }
  registerGroup(groupId, agentIds) {
    const group = {
      groupId,
      agentIds: new Set(agentIds),
      completedRecords: new Map,
      delivered: false,
      isStraggler: false
    };
    this.groups.set(groupId, group);
    for (const id of agentIds) {
      this.agentToGroup.set(id, groupId);
    }
  }
  onAgentComplete(record3) {
    const groupId = this.agentToGroup.get(record3.id);
    if (!groupId)
      return "pass";
    const group = this.groups.get(groupId);
    if (!group || group.delivered)
      return "pass";
    group.completedRecords.set(record3.id, record3);
    if (group.completedRecords.size >= group.agentIds.size) {
      this.deliver(group, false);
      return "delivered";
    }
    if (!group.timeoutHandle) {
      const timeout = group.isStraggler ? STRAGGLER_TIMEOUT : this.groupTimeout;
      group.timeoutHandle = setTimeout(() => {
        this.onTimeout(group);
      }, timeout);
    }
    return "held";
  }
  onTimeout(group) {
    if (group.delivered)
      return;
    group.timeoutHandle = undefined;
    const remaining = new Set;
    for (const id of group.agentIds) {
      if (!group.completedRecords.has(id))
        remaining.add(id);
    }
    for (const id of group.completedRecords.keys()) {
      this.agentToGroup.delete(id);
    }
    this.deliverCb([...group.completedRecords.values()], true);
    group.completedRecords.clear();
    group.agentIds = remaining;
    group.isStraggler = true;
  }
  deliver(group, partial3) {
    if (group.timeoutHandle) {
      clearTimeout(group.timeoutHandle);
      group.timeoutHandle = undefined;
    }
    group.delivered = true;
    this.deliverCb([...group.completedRecords.values()], partial3);
    this.cleanupGroup(group.groupId);
  }
  cleanupGroup(groupId) {
    const group = this.groups.get(groupId);
    if (!group)
      return;
    for (const id of group.agentIds) {
      this.agentToGroup.delete(id);
    }
    this.groups.delete(groupId);
  }
  isGrouped(agentId) {
    return this.agentToGroup.has(agentId);
  }
  dispose() {
    for (const group of this.groups.values()) {
      if (group.timeoutHandle)
        clearTimeout(group.timeoutHandle);
    }
    this.groups.clear();
    this.agentToGroup.clear();
  }
}

// src/index.ts
init_invocation_config();
init_mention();

// src/mention-clone.ts
init_child_context();
init_mention();
import {
  buildSessionContext,
  createAgentSession as createAgentSession2,
  SessionManager as SessionManager2
} from "@earendil-works/pi-coding-agent";
async function runMentionClone(opts) {
  const { ctx, type: type4, message, agentTool } = opts;
  let spawned = false;
  const cloneAgentTool = {
    ...agentTool,
    execute: (_cloneToolCallId, params, signal, onUpdate, _cloneCtx) => {
      if (spawned) {
        return Promise.resolve({
          content: [{ type: "text", text: "Already started an agent for this mention. Stop here." }],
          details: undefined,
          isError: true
        });
      }
      spawned = true;
      return agentTool.execute(undefined, { ...params, run_in_background: true }, signal, onUpdate, ctx);
    }
  };
  let session;
  try {
    const parentModelRuntime = ctx.modelRegistry.runtime;
    const conversation = buildSessionContext(ctx.sessionManager.getEntries(), ctx.sessionManager.getLeafId());
    const thinkingLevel = ctx.thinkingLevel;
    const created = await runInChildSessionContext(() => createAgentSession2({
      cwd: ctx.cwd,
      sessionManager: SessionManager2.inMemory(ctx.cwd),
      model: ctx.model,
      ...thinkingLevel && { thinkingLevel },
      modelRegistry: ctx.modelRegistry,
      ...parentModelRuntime !== undefined && { modelRuntime: parentModelRuntime },
      tools: [cloneAgentTool.name],
      customTools: [cloneAgentTool]
    }));
    session = created.session;
    const systemPrompt = ctx.getSystemPrompt?.();
    if (systemPrompt)
      session.agent.state.systemPrompt = systemPrompt;
    session.agent.state.messages.push(...conversation.messages);
    await session.prompt(`${message}

${agentMentionReminder(type4)}`);
  } catch (err) {
    return { spawned, error: err instanceof Error ? err.message : String(err) };
  } finally {
    session?.dispose?.();
  }
  return spawned ? { spawned: true } : { spawned: false, error: "the conversation clone did not start it" };
}

// src/index.ts
init_model_scope();
init_nested_tools();
init_output_file();

// node_modules/croner/dist/croner.js
function T(s) {
  return Date.UTC(s.y, s.m - 1, s.d, s.h, s.i, s.s);
}
function D(s, e) {
  return s.y === e.y && s.m === e.m && s.d === e.d && s.h === e.h && s.i === e.i && s.s === e.s;
}
function A(s, e) {
  let t = new Date(Date.parse(s));
  if (isNaN(t))
    throw new Error("Invalid ISO8601 passed to timezone parser.");
  let r = s.substring(9);
  return r.includes("Z") || r.includes("+") || r.includes("-") ? b(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds(), "Etc/UTC") : b(t.getFullYear(), t.getMonth() + 1, t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds(), e);
}
function v(s, e, t) {
  return k(A(s, e), t);
}
function k(s, e) {
  let t = new Date(T(s)), r = g(t, s.tz), n = T(s), i = T(r), a = n - i, o = new Date(t.getTime() + a), h = g(o, s.tz);
  if (D(h, s)) {
    let u = new Date(o.getTime() - 3600000), d = g(u, s.tz);
    return D(d, s) ? u : o;
  }
  let l = new Date(o.getTime() + T(s) - T(h)), y = g(l, s.tz);
  if (D(y, s))
    return l;
  if (e)
    throw new Error("Invalid date passed to fromTZ()");
  return o.getTime() > l.getTime() ? o : l;
}
function g(s, e) {
  let t, r;
  try {
    t = new Intl.DateTimeFormat("en-US", { timeZone: e, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: false }), r = t.formatToParts(s);
  } catch (i) {
    let a = i instanceof Error ? i.message : String(i);
    throw new RangeError(`toTZ: Invalid timezone '${e}' or date. Please provide a valid IANA timezone (e.g., 'America/New_York', 'Europe/Stockholm'). Original error: ${a}`);
  }
  let n = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0 };
  for (let i of r)
    (i.type === "year" || i.type === "month" || i.type === "day" || i.type === "hour" || i.type === "minute" || i.type === "second") && (n[i.type] = parseInt(i.value, 10));
  if (isNaN(n.year) || isNaN(n.month) || isNaN(n.day) || isNaN(n.hour) || isNaN(n.minute) || isNaN(n.second))
    throw new Error(`toTZ: Failed to parse all date components from timezone '${e}'. This may indicate an invalid date or timezone configuration. Parsed components: ${JSON.stringify(n)}`);
  return n.hour === 24 && (n.hour = 0), { y: n.year, m: n.month, d: n.day, h: n.hour, i: n.minute, s: n.second, tz: e };
}
function b(s, e, t, r, n, i, a) {
  return { y: s, m: e, d: t, h: r, i: n, s: i, tz: a };
}
var O = [1, 2, 4, 8, 16];
var C = class {
  pattern;
  timezone;
  mode;
  alternativeWeekdays;
  sloppyRanges;
  second;
  minute;
  hour;
  day;
  month;
  dayOfWeek;
  year;
  lastDayOfMonth;
  lastWeekday;
  nearestWeekdays;
  starDOM;
  starDOW;
  starYear;
  useAndLogic;
  constructor(e, t, r) {
    this.pattern = e, this.timezone = t, this.mode = r?.mode ?? "auto", this.alternativeWeekdays = r?.alternativeWeekdays ?? false, this.sloppyRanges = r?.sloppyRanges ?? false, this.second = Array(60).fill(0), this.minute = Array(60).fill(0), this.hour = Array(24).fill(0), this.day = Array(31).fill(0), this.month = Array(12).fill(0), this.dayOfWeek = Array(7).fill(0), this.year = Array(1e4).fill(0), this.lastDayOfMonth = false, this.lastWeekday = false, this.nearestWeekdays = Array(31).fill(0), this.starDOM = false, this.starDOW = false, this.starYear = false, this.useAndLogic = false, this.parse();
  }
  parse() {
    if (!(typeof this.pattern == "string" || this.pattern instanceof String))
      throw new TypeError("CronPattern: Pattern has to be of type string.");
    this.pattern.indexOf("@") >= 0 && (this.pattern = this.handleNicknames(this.pattern).trim());
    let e = this.pattern.match(/\S+/g) || [""], t = e.length;
    if (e.length < 5 || e.length > 7)
      throw new TypeError("CronPattern: invalid configuration format ('" + this.pattern + "'), exactly five, six, or seven space separated parts are required.");
    if (this.mode !== "auto") {
      let n;
      switch (this.mode) {
        case "5-part":
          n = 5;
          break;
        case "6-part":
          n = 6;
          break;
        case "7-part":
          n = 7;
          break;
        case "5-or-6-parts":
          n = [5, 6];
          break;
        case "6-or-7-parts":
          n = [6, 7];
          break;
        default:
          n = 0;
      }
      if (!(Array.isArray(n) ? n.includes(t) : t === n)) {
        let a = Array.isArray(n) ? n.join(" or ") : n.toString();
        throw new TypeError(`CronPattern: mode '${this.mode}' requires exactly ${a} parts, but pattern '${this.pattern}' has ${t} parts.`);
      }
    }
    if (e.length === 5 && e.unshift("0"), e.length === 6 && e.push("*"), e[3].toUpperCase() === "LW" ? (this.lastWeekday = true, e[3] = "") : e[3].toUpperCase().indexOf("L") >= 0 && (e[3] = e[3].replace(/L/gi, ""), this.lastDayOfMonth = true), e[3] == "*" && (this.starDOM = true), e[6] == "*" && (this.starYear = true), e[4].length >= 3 && (e[4] = this.replaceAlphaMonths(e[4])), e[5].length >= 3 && (e[5] = this.alternativeWeekdays ? this.replaceAlphaDaysQuartz(e[5]) : this.replaceAlphaDays(e[5])), e[5].startsWith("+") && (this.useAndLogic = true, e[5] = e[5].substring(1), e[5] === ""))
      throw new TypeError("CronPattern: Day-of-week field cannot be empty after '+' modifier.");
    switch (e[5] == "*" && (this.starDOW = true), this.pattern.indexOf("?") >= 0 && (e[0] = e[0].replace(/\?/g, "*"), e[1] = e[1].replace(/\?/g, "*"), e[2] = e[2].replace(/\?/g, "*"), e[3] = e[3].replace(/\?/g, "*"), e[4] = e[4].replace(/\?/g, "*"), e[5] = e[5].replace(/\?/g, "*"), e[6] && (e[6] = e[6].replace(/\?/g, "*"))), this.mode) {
      case "5-part":
        e[0] = "0", e[6] = "*";
        break;
      case "6-part":
        e[6] = "*";
        break;
      case "5-or-6-parts":
        e[6] = "*";
        break;
      case "6-or-7-parts":
        break;
      case "7-part":
      case "auto":
        break;
    }
    this.throwAtIllegalCharacters(e), this.partToArray("second", e[0], 0, 1), this.partToArray("minute", e[1], 0, 1), this.partToArray("hour", e[2], 0, 1), this.partToArray("day", e[3], -1, 1), this.partToArray("month", e[4], -1, 1);
    let r = this.alternativeWeekdays ? -1 : 0;
    this.partToArray("dayOfWeek", e[5], r, 63), this.partToArray("year", e[6], 0, 1), !this.alternativeWeekdays && this.dayOfWeek[7] && (this.dayOfWeek[0] = this.dayOfWeek[7]);
  }
  partToArray(e, t, r, n) {
    let i = this[e], a = e === "day" && this.lastDayOfMonth, o = e === "day" && this.lastWeekday;
    if (t === "" && !a && !o)
      throw new TypeError("CronPattern: configuration entry " + e + " (" + t + ") is empty, check for trailing spaces.");
    if (t === "*")
      return i.fill(n);
    let h = t.split(",");
    if (h.length > 1)
      for (let l = 0;l < h.length; l++)
        this.partToArray(e, h[l], r, n);
    else
      t.indexOf("-") !== -1 && t.indexOf("/") !== -1 ? this.handleRangeWithStepping(t, e, r, n) : t.indexOf("-") !== -1 ? this.handleRange(t, e, r, n) : t.indexOf("/") !== -1 ? this.handleStepping(t, e, r, n) : t !== "" && this.handleNumber(t, e, r, n);
  }
  throwAtIllegalCharacters(e) {
    for (let t = 0;t < e.length; t++)
      if ((t === 3 ? /[^/*0-9,\-WwLl]+/ : t === 5 ? /[^/*0-9,\-#Ll]+/ : /[^/*0-9,\-]+/).test(e[t]))
        throw new TypeError("CronPattern: configuration entry " + t + " (" + e[t] + ") contains illegal characters.");
  }
  handleNumber(e, t, r, n) {
    let i = this.extractNth(e, t), a = e.toUpperCase().includes("W");
    if (t !== "day" && a)
      throw new TypeError("CronPattern: Nearest weekday modifier (W) only allowed in day-of-month.");
    a && (t = "nearestWeekdays");
    let o = parseInt(i[0], 10) + r;
    if (isNaN(o))
      throw new TypeError("CronPattern: " + t + " is not a number: '" + e + "'");
    this.setPart(t, o, i[1] || n);
  }
  setPart(e, t, r) {
    if (!Object.prototype.hasOwnProperty.call(this, e))
      throw new TypeError("CronPattern: Invalid part specified: " + e);
    if (e === "dayOfWeek") {
      if (t === 7 && (t = 0), t < 0 || t > 6)
        throw new RangeError("CronPattern: Invalid value for dayOfWeek: " + t);
      this.setNthWeekdayOfMonth(t, r);
      return;
    }
    if (e === "second" || e === "minute") {
      if (t < 0 || t >= 60)
        throw new RangeError("CronPattern: Invalid value for " + e + ": " + t);
    } else if (e === "hour") {
      if (t < 0 || t >= 24)
        throw new RangeError("CronPattern: Invalid value for " + e + ": " + t);
    } else if (e === "day" || e === "nearestWeekdays") {
      if (t < 0 || t >= 31)
        throw new RangeError("CronPattern: Invalid value for " + e + ": " + t);
    } else if (e === "month") {
      if (t < 0 || t >= 12)
        throw new RangeError("CronPattern: Invalid value for " + e + ": " + t);
    } else if (e === "year" && (t < 1 || t >= 1e4))
      throw new RangeError("CronPattern: Invalid value for " + e + ": " + t + " (supported range: 1-9999)");
    this[e][t] = r;
  }
  validateNotNaN(e, t) {
    if (isNaN(e))
      throw new TypeError(t);
  }
  validateRange(e, t, r, n, i) {
    if (e > t)
      throw new TypeError("CronPattern: From value is larger than to value: '" + i + "'");
    if (r !== undefined) {
      if (r === 0)
        throw new TypeError("CronPattern: Syntax error, illegal stepping: 0");
      if (r > this[n].length)
        throw new TypeError("CronPattern: Syntax error, steps cannot be greater than maximum value of part (" + this[n].length + ")");
    }
  }
  handleRangeWithStepping(e, t, r, n) {
    if (e.toUpperCase().includes("W"))
      throw new TypeError("CronPattern: Syntax error, W is not allowed in ranges with stepping.");
    let i = this.extractNth(e, t), a = i[0].match(/^(\d+)-(\d+)\/(\d+)$/);
    if (a === null)
      throw new TypeError("CronPattern: Syntax error, illegal range with stepping: '" + e + "'");
    let [, o, h, l] = a, y = parseInt(o, 10) + r, u = parseInt(h, 10) + r, d = parseInt(l, 10);
    this.validateNotNaN(y, "CronPattern: Syntax error, illegal lower range (NaN)"), this.validateNotNaN(u, "CronPattern: Syntax error, illegal upper range (NaN)"), this.validateNotNaN(d, "CronPattern: Syntax error, illegal stepping: (NaN)"), this.validateRange(y, u, d, t, e);
    for (let c = y;c <= u; c += d)
      this.setPart(t, c, i[1] || n);
  }
  extractNth(e, t) {
    let r = e, n;
    if (r.includes("#")) {
      if (t !== "dayOfWeek")
        throw new Error("CronPattern: nth (#) only allowed in day-of-week field");
      n = r.split("#")[1], r = r.split("#")[0];
    } else if (r.toUpperCase().endsWith("L")) {
      if (t !== "dayOfWeek")
        throw new Error("CronPattern: L modifier only allowed in day-of-week field (use L alone for day-of-month)");
      n = "L", r = r.slice(0, -1);
    }
    return [r, n];
  }
  handleRange(e, t, r, n) {
    if (e.toUpperCase().includes("W"))
      throw new TypeError("CronPattern: Syntax error, W is not allowed in a range.");
    let i = this.extractNth(e, t), a = i[0].split("-");
    if (a.length !== 2)
      throw new TypeError("CronPattern: Syntax error, illegal range: '" + e + "'");
    let o = parseInt(a[0], 10) + r, h = parseInt(a[1], 10) + r;
    this.validateNotNaN(o, "CronPattern: Syntax error, illegal lower range (NaN)"), this.validateNotNaN(h, "CronPattern: Syntax error, illegal upper range (NaN)"), this.validateRange(o, h, undefined, t, e);
    for (let l = o;l <= h; l++)
      this.setPart(t, l, i[1] || n);
  }
  handleStepping(e, t, r, n) {
    if (e.toUpperCase().includes("W"))
      throw new TypeError("CronPattern: Syntax error, W is not allowed in parts with stepping.");
    let i = this.extractNth(e, t), a = i[0].split("/");
    if (a.length !== 2)
      throw new TypeError("CronPattern: Syntax error, illegal stepping: '" + e + "'");
    if (this.sloppyRanges)
      a[0] === "" && (a[0] = "*");
    else {
      if (a[0] === "")
        throw new TypeError("CronPattern: Syntax error, stepping with missing prefix ('" + e + "') is not allowed. Use wildcard (*/step) or range (min-max/step) instead.");
      if (a[0] !== "*")
        throw new TypeError("CronPattern: Syntax error, stepping with numeric prefix ('" + e + "') is not allowed. Use wildcard (*/step) or range (min-max/step) instead.");
    }
    let o = 0;
    a[0] !== "*" && (o = parseInt(a[0], 10) + r);
    let h = parseInt(a[1], 10);
    this.validateNotNaN(h, "CronPattern: Syntax error, illegal stepping: (NaN)"), this.validateRange(0, this[t].length - 1, h, t, e);
    for (let l = o;l < this[t].length; l += h)
      this.setPart(t, l, i[1] || n);
  }
  replaceAlphaDays(e) {
    return e.replace(/-sun/gi, "-7").replace(/sun/gi, "0").replace(/mon/gi, "1").replace(/tue/gi, "2").replace(/wed/gi, "3").replace(/thu/gi, "4").replace(/fri/gi, "5").replace(/sat/gi, "6");
  }
  replaceAlphaDaysQuartz(e) {
    return e.replace(/sun/gi, "1").replace(/mon/gi, "2").replace(/tue/gi, "3").replace(/wed/gi, "4").replace(/thu/gi, "5").replace(/fri/gi, "6").replace(/sat/gi, "7");
  }
  replaceAlphaMonths(e) {
    return e.replace(/jan/gi, "1").replace(/feb/gi, "2").replace(/mar/gi, "3").replace(/apr/gi, "4").replace(/may/gi, "5").replace(/jun/gi, "6").replace(/jul/gi, "7").replace(/aug/gi, "8").replace(/sep/gi, "9").replace(/oct/gi, "10").replace(/nov/gi, "11").replace(/dec/gi, "12");
  }
  handleNicknames(e) {
    let t = e.trim().toLowerCase();
    if (t === "@yearly" || t === "@annually")
      return "0 0 1 1 *";
    if (t === "@monthly")
      return "0 0 1 * *";
    if (t === "@weekly")
      return "0 0 * * 0";
    if (t === "@daily" || t === "@midnight")
      return "0 0 * * *";
    if (t === "@hourly")
      return "0 * * * *";
    if (t === "@reboot")
      throw new TypeError("CronPattern: @reboot is not supported in this environment. This is an event-based trigger that requires system startup detection.");
    return e;
  }
  setNthWeekdayOfMonth(e, t) {
    if (typeof t != "number" && t.toUpperCase() === "L")
      this.dayOfWeek[e] = this.dayOfWeek[e] | 32;
    else if (t === 63)
      this.dayOfWeek[e] = 63;
    else if (t < 6 && t > 0)
      this.dayOfWeek[e] = this.dayOfWeek[e] | O[t - 1];
    else
      throw new TypeError(`CronPattern: nth weekday out of range, should be 1-5 or L. Value: ${t}, Type: ${typeof t}`);
  }
};
var P = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var f = [["month", "year", 0], ["day", "month", -1], ["hour", "day", 0], ["minute", "hour", 0], ["second", "minute", 0]];
var m = class s {
  tz;
  ms;
  second;
  minute;
  hour;
  day;
  month;
  year;
  constructor(e, t) {
    if (this.tz = t, e && e instanceof Date)
      if (!isNaN(e))
        this.fromDate(e);
      else
        throw new TypeError("CronDate: Invalid date passed to CronDate constructor");
    else if (e == null)
      this.fromDate(new Date);
    else if (e && typeof e == "string")
      this.fromString(e);
    else if (e instanceof s)
      this.fromCronDate(e);
    else
      throw new TypeError("CronDate: Invalid type (" + typeof e + ") passed to CronDate constructor");
  }
  getLastDayOfMonth(e, t) {
    return t !== 1 ? P[t] : new Date(Date.UTC(e, t + 1, 0)).getUTCDate();
  }
  getLastWeekday(e, t) {
    let r = this.getLastDayOfMonth(e, t), i = new Date(Date.UTC(e, t, r)).getUTCDay();
    return i === 0 ? r - 2 : i === 6 ? r - 1 : r;
  }
  getNearestWeekday(e, t, r) {
    let n = this.getLastDayOfMonth(e, t);
    if (r > n)
      return -1;
    let a = new Date(Date.UTC(e, t, r)).getUTCDay();
    return a === 0 ? r === n ? r - 2 : r + 1 : a === 6 ? r === 1 ? r + 2 : r - 1 : r;
  }
  isNthWeekdayOfMonth(e, t, r, n) {
    let a = new Date(Date.UTC(e, t, r)).getUTCDay(), o = 0;
    for (let h = 1;h <= r; h++)
      new Date(Date.UTC(e, t, h)).getUTCDay() === a && o++;
    if (n & 63 && O[o - 1] & n)
      return true;
    if (n & 32) {
      let h = this.getLastDayOfMonth(e, t);
      for (let l = r + 1;l <= h; l++)
        if (new Date(Date.UTC(e, t, l)).getUTCDay() === a)
          return false;
      return true;
    }
    return false;
  }
  fromDate(e) {
    if (this.tz !== undefined)
      if (typeof this.tz == "number")
        this.ms = e.getUTCMilliseconds(), this.second = e.getUTCSeconds(), this.minute = e.getUTCMinutes() + this.tz, this.hour = e.getUTCHours(), this.day = e.getUTCDate(), this.month = e.getUTCMonth(), this.year = e.getUTCFullYear(), this.apply();
      else
        try {
          let t = g(e, this.tz);
          this.ms = e.getMilliseconds(), this.second = t.s, this.minute = t.i, this.hour = t.h, this.day = t.d, this.month = t.m - 1, this.year = t.y;
        } catch (t) {
          let r = t instanceof Error ? t.message : String(t);
          throw new TypeError(`CronDate: Failed to convert date to timezone '${this.tz}'. This may happen with invalid timezone names or dates. Original error: ${r}`);
        }
    else
      this.ms = e.getMilliseconds(), this.second = e.getSeconds(), this.minute = e.getMinutes(), this.hour = e.getHours(), this.day = e.getDate(), this.month = e.getMonth(), this.year = e.getFullYear();
  }
  fromCronDate(e) {
    this.tz = e.tz, this.year = e.year, this.month = e.month, this.day = e.day, this.hour = e.hour, this.minute = e.minute, this.second = e.second, this.ms = e.ms;
  }
  apply() {
    if (this.month > 11 || this.month < 0 || this.day > P[this.month] || this.day < 1 || this.hour > 59 || this.minute > 59 || this.second > 59 || this.hour < 0 || this.minute < 0 || this.second < 0) {
      let e = new Date(Date.UTC(this.year, this.month, this.day, this.hour, this.minute, this.second, this.ms));
      return this.ms = e.getUTCMilliseconds(), this.second = e.getUTCSeconds(), this.minute = e.getUTCMinutes(), this.hour = e.getUTCHours(), this.day = e.getUTCDate(), this.month = e.getUTCMonth(), this.year = e.getUTCFullYear(), true;
    } else
      return false;
  }
  fromString(e) {
    if (typeof this.tz == "number") {
      let t = v(e);
      this.ms = t.getUTCMilliseconds(), this.second = t.getUTCSeconds(), this.minute = t.getUTCMinutes(), this.hour = t.getUTCHours(), this.day = t.getUTCDate(), this.month = t.getUTCMonth(), this.year = t.getUTCFullYear(), this.apply();
    } else
      return this.fromDate(v(e, this.tz));
  }
  findNext(e, t, r, n) {
    return this._findMatch(e, t, r, n, 1);
  }
  _findMatch(e, t, r, n, i) {
    let a = this[t], o;
    r.lastDayOfMonth && (o = this.getLastDayOfMonth(this.year, this.month));
    let h = !r.starDOW && t == "day" ? new Date(Date.UTC(this.year, this.month, 1, 0, 0, 0, 0)).getUTCDay() : undefined, l = this[t] + n, y = i === 1 ? (u) => u < r[t].length : (u) => u >= 0;
    for (let u = l;y(u); u += i) {
      let d = r[t][u];
      if (t === "day" && !d) {
        for (let c = 0;c < r.nearestWeekdays.length; c++)
          if (r.nearestWeekdays[c]) {
            let M = this.getNearestWeekday(this.year, this.month, c - n);
            if (M === -1)
              continue;
            if (M === u - n) {
              d = 1;
              break;
            }
          }
      }
      if (t === "day" && r.lastWeekday) {
        let c = this.getLastWeekday(this.year, this.month);
        u - n === c && (d = 1);
      }
      if (t === "day" && r.lastDayOfMonth && u - n == o && (d = 1), t === "day" && !r.starDOW) {
        let c = r.dayOfWeek[(h + (u - n - 1)) % 7];
        if (c && c & 63)
          c = this.isNthWeekdayOfMonth(this.year, this.month, u - n, c) ? 1 : 0;
        else if (c)
          throw new Error(`CronDate: Invalid value for dayOfWeek encountered. ${c}`);
        r.useAndLogic ? d = d && c : !e.domAndDow && !r.starDOM ? d = d || c : d = d && c;
      }
      if (d)
        return this[t] = u - n, a !== this[t] ? 2 : 1;
    }
    return 3;
  }
  recurse(e, t, r) {
    if (r === 0 && !e.starYear) {
      if (this.year >= 0 && this.year < e.year.length && e.year[this.year] === 0) {
        let i = -1;
        for (let a = this.year + 1;a < e.year.length && a < 1e4; a++)
          if (e.year[a] === 1) {
            i = a;
            break;
          }
        if (i === -1)
          return null;
        this.year = i, this.month = 0, this.day = 1, this.hour = 0, this.minute = 0, this.second = 0, this.ms = 0;
      }
      if (this.year >= 1e4)
        return null;
    }
    let n = this.findNext(t, f[r][0], e, f[r][2]);
    if (n > 1) {
      let i = r + 1;
      for (;i < f.length; )
        this[f[i][0]] = -f[i][2], i++;
      if (n === 3) {
        if (this[f[r][1]]++, this[f[r][0]] = -f[r][2], this.apply(), r === 0 && !e.starYear) {
          for (;this.year >= 0 && this.year < e.year.length && e.year[this.year] === 0 && this.year < 1e4; )
            this.year++;
          if (this.year >= 1e4 || this.year >= e.year.length)
            return null;
        }
        return this.recurse(e, t, 0);
      } else if (this.apply())
        return this.recurse(e, t, r - 1);
    }
    return r += 1, r >= f.length ? this : (e.starYear ? this.year >= 3000 : this.year >= 1e4) ? null : this.recurse(e, t, r);
  }
  increment(e, t, r) {
    return this.second += t.interval !== undefined && t.interval > 1 && r ? t.interval : 1, this.ms = 0, this.apply(), this.recurse(e, t, 0);
  }
  decrement(e, t) {
    return this.second -= t.interval !== undefined && t.interval > 1 ? t.interval : 1, this.ms = 0, this.apply(), this.recurseBackward(e, t, 0, 0);
  }
  recurseBackward(e, t, r, n = 0) {
    if (n > 1e4)
      return null;
    if (r === 0 && !e.starYear) {
      if (this.year >= 0 && this.year < e.year.length && e.year[this.year] === 0) {
        let a = -1;
        for (let o = this.year - 1;o >= 0; o--)
          if (e.year[o] === 1) {
            a = o;
            break;
          }
        if (a === -1)
          return null;
        this.year = a, this.month = 11, this.day = 31, this.hour = 23, this.minute = 59, this.second = 59, this.ms = 0;
      }
      if (this.year < 0)
        return null;
    }
    let i = this.findPrevious(t, f[r][0], e, f[r][2]);
    if (i > 1) {
      let a = r + 1;
      for (;a < f.length; ) {
        let o = f[a][0], h = f[a][2], l = this.getMaxPatternValue(o, e, h);
        this[o] = l, a++;
      }
      if (i === 3) {
        if (this[f[r][1]]--, r === 0) {
          let y = this.getLastDayOfMonth(this.year, this.month);
          this.day > y && (this.day = y);
        }
        if (r === 1)
          if (this.day <= 0)
            this.day = 1;
          else {
            let y = this.year, u = this.month;
            for (;u < 0; )
              u += 12, y--;
            for (;u > 11; )
              u -= 12, y++;
            let d = u !== 1 ? P[u] : new Date(Date.UTC(y, u + 1, 0)).getUTCDate();
            this.day > d && (this.day = d);
          }
        this.apply();
        let o = f[r][0], h = f[r][2], l = this.getMaxPatternValue(o, e, h);
        if (o === "day") {
          let y = this.getLastDayOfMonth(this.year, this.month);
          this[o] = Math.min(l, y);
        } else
          this[o] = l;
        if (this.apply(), r === 0) {
          let y = f[1][2], u = this.getMaxPatternValue("day", e, y), d = this.getLastDayOfMonth(this.year, this.month), c = Math.min(u, d);
          c !== this.day && (this.day = c, this.hour = this.getMaxPatternValue("hour", e, f[2][2]), this.minute = this.getMaxPatternValue("minute", e, f[3][2]), this.second = this.getMaxPatternValue("second", e, f[4][2]));
        }
        if (r === 0 && !e.starYear) {
          for (;this.year >= 0 && this.year < e.year.length && e.year[this.year] === 0; )
            this.year--;
          if (this.year < 0)
            return null;
        }
        return this.recurseBackward(e, t, 0, n + 1);
      } else if (this.apply())
        return this.recurseBackward(e, t, r - 1, n + 1);
    }
    return r += 1, r >= f.length ? this : this.year < 0 ? null : this.recurseBackward(e, t, r, n + 1);
  }
  getMaxPatternValue(e, t, r) {
    if (e === "day" && t.lastDayOfMonth)
      return this.getLastDayOfMonth(this.year, this.month);
    if (e === "day" && !t.starDOW)
      return this.getLastDayOfMonth(this.year, this.month);
    for (let n = t[e].length - 1;n >= 0; n--)
      if (t[e][n])
        return n - r;
    return t[e].length - 1 - r;
  }
  findPrevious(e, t, r, n) {
    return this._findMatch(e, t, r, n, -1);
  }
  getDate(e) {
    return e || this.tz === undefined ? new Date(this.year, this.month, this.day, this.hour, this.minute, this.second, this.ms) : typeof this.tz == "number" ? new Date(Date.UTC(this.year, this.month, this.day, this.hour, this.minute - this.tz, this.second, this.ms)) : k(b(this.year, this.month + 1, this.day, this.hour, this.minute, this.second, this.tz), false);
  }
  getTime() {
    return this.getDate(false).getTime();
  }
  match(e, t) {
    if (!e.starYear && (this.year < 0 || this.year >= e.year.length || e.year[this.year] === 0))
      return false;
    for (let r = 0;r < f.length; r++) {
      let n = f[r][0], i = f[r][2], a = this[n];
      if (a + i < 0 || a + i >= e[n].length)
        return false;
      let o = e[n][a + i];
      if (n === "day") {
        if (!o) {
          for (let h = 0;h < e.nearestWeekdays.length; h++)
            if (e.nearestWeekdays[h]) {
              let l = this.getNearestWeekday(this.year, this.month, h - i);
              if (l !== -1 && l === a) {
                o = 1;
                break;
              }
            }
        }
        if (e.lastWeekday) {
          let h = this.getLastWeekday(this.year, this.month);
          a === h && (o = 1);
        }
        if (e.lastDayOfMonth) {
          let h = this.getLastDayOfMonth(this.year, this.month);
          a === h && (o = 1);
        }
        if (!e.starDOW) {
          let h = new Date(Date.UTC(this.year, this.month, 1, 0, 0, 0, 0)).getUTCDay(), l = e.dayOfWeek[(h + (a - 1)) % 7];
          l && l & 63 && (l = this.isNthWeekdayOfMonth(this.year, this.month, a, l) ? 1 : 0), e.useAndLogic ? o = o && l : !t.domAndDow && !e.starDOM ? o = o || l : o = o && l;
        }
      }
      if (!o)
        return false;
    }
    return true;
  }
};
function R(s2) {
  if (s2 === undefined && (s2 = {}), delete s2.name, s2.legacyMode !== undefined && s2.domAndDow === undefined ? s2.domAndDow = !s2.legacyMode : s2.domAndDow === undefined && (s2.domAndDow = false), s2.legacyMode = !s2.domAndDow, s2.paused = s2.paused === undefined ? false : s2.paused, s2.maxRuns = s2.maxRuns === undefined ? 1 / 0 : s2.maxRuns, s2.catch = s2.catch === undefined ? false : s2.catch, s2.interval = s2.interval === undefined ? 0 : parseInt(s2.interval.toString(), 10), s2.utcOffset = s2.utcOffset === undefined ? undefined : parseInt(s2.utcOffset.toString(), 10), s2.dayOffset = s2.dayOffset === undefined ? 0 : parseInt(s2.dayOffset.toString(), 10), s2.unref = s2.unref === undefined ? false : s2.unref, s2.mode = s2.mode === undefined ? "auto" : s2.mode, s2.alternativeWeekdays = s2.alternativeWeekdays === undefined ? false : s2.alternativeWeekdays, s2.sloppyRanges = s2.sloppyRanges === undefined ? false : s2.sloppyRanges, !["auto", "5-part", "6-part", "7-part", "5-or-6-parts", "6-or-7-parts"].includes(s2.mode))
    throw new Error("CronOptions: mode must be one of 'auto', '5-part', '6-part', '7-part', '5-or-6-parts', or '6-or-7-parts'.");
  if (s2.startAt && (s2.startAt = new m(s2.startAt, s2.timezone)), s2.stopAt && (s2.stopAt = new m(s2.stopAt, s2.timezone)), s2.interval !== null) {
    if (isNaN(s2.interval))
      throw new Error("CronOptions: Supplied value for interval is not a number");
    if (s2.interval < 0)
      throw new Error("CronOptions: Supplied value for interval can not be negative");
  }
  if (s2.utcOffset !== undefined) {
    if (isNaN(s2.utcOffset))
      throw new Error("CronOptions: Invalid value passed for utcOffset, should be number representing minutes offset from UTC.");
    if (s2.utcOffset < -870 || s2.utcOffset > 870)
      throw new Error("CronOptions: utcOffset out of bounds.");
    if (s2.utcOffset !== undefined && s2.timezone)
      throw new Error("CronOptions: Combining 'utcOffset' with 'timezone' is not allowed.");
  }
  if (s2.unref !== true && s2.unref !== false)
    throw new Error("CronOptions: Unref should be either true, false or undefined(false).");
  if (s2.dayOffset !== undefined && s2.dayOffset !== 0 && isNaN(s2.dayOffset))
    throw new Error("CronOptions: Invalid value passed for dayOffset, should be a number representing days to offset.");
  return s2;
}
function p(s2) {
  return Object.prototype.toString.call(s2) === "[object Function]" || typeof s2 == "function" || s2 instanceof Function;
}
function _(s2) {
  return p(s2);
}
function x(s2) {
  typeof Deno < "u" && typeof Deno.unrefTimer < "u" ? Deno.unrefTimer(s2) : s2 && typeof s2.unref < "u" && s2.unref();
}
var W = 30 * 1000;
var w = [];
var E = class {
  name;
  options;
  _states;
  fn;
  getTz() {
    return this.options.timezone || this.options.utcOffset;
  }
  applyDayOffset(e) {
    if (this.options.dayOffset !== undefined && this.options.dayOffset !== 0) {
      let t = this.options.dayOffset * 24 * 60 * 60 * 1000;
      return new Date(e.getTime() + t);
    }
    return e;
  }
  constructor(e, t, r) {
    let n, i;
    if (p(t))
      i = t;
    else if (typeof t == "object")
      n = t;
    else if (t !== undefined)
      throw new Error("Cron: Invalid argument passed for optionsIn. Should be one of function, or object (options).");
    if (p(r))
      i = r;
    else if (typeof r == "object")
      n = r;
    else if (r !== undefined)
      throw new Error("Cron: Invalid argument passed for funcIn. Should be one of function, or object (options).");
    if (this.name = n?.name, this.options = R(n), this._states = { kill: false, blocking: false, previousRun: undefined, currentRun: undefined, once: undefined, currentTimeout: undefined, maxRuns: n ? n.maxRuns : undefined, paused: n ? n.paused : false, pattern: new C("* * * * *", undefined, { mode: "auto" }) }, e && (e instanceof Date || typeof e == "string" && e.indexOf(":") > 0) ? this._states.once = new m(e, this.getTz()) : this._states.pattern = new C(e, this.options.timezone, { mode: this.options.mode, alternativeWeekdays: this.options.alternativeWeekdays, sloppyRanges: this.options.sloppyRanges }), this.name) {
      if (w.find((o) => o.name === this.name))
        throw new Error("Cron: Tried to initialize new named job '" + this.name + "', but name already taken.");
      w.push(this);
    }
    return i !== undefined && _(i) && (this.fn = i, this.schedule()), this;
  }
  nextRun(e) {
    let t = this._next(e);
    return t ? this.applyDayOffset(t.getDate(false)) : null;
  }
  nextRuns(e, t) {
    this._states.maxRuns !== undefined && e > this._states.maxRuns && (e = this._states.maxRuns);
    let r = t || this._states.currentRun || undefined;
    return this._enumerateRuns(e, r, "next");
  }
  previousRuns(e, t) {
    return this._enumerateRuns(e, t || undefined, "previous");
  }
  _enumerateRuns(e, t, r) {
    let n = [], i = t ? new m(t, this.getTz()) : null, a = r === "next" ? this._next : this._previous;
    for (;e--; ) {
      let o = a.call(this, i);
      if (!o)
        break;
      let h = o.getDate(false);
      n.push(this.applyDayOffset(h)), i = o;
    }
    return n;
  }
  match(e) {
    if (this._states.once) {
      let r = new m(e, this.getTz());
      r.ms = 0;
      let n = new m(this._states.once, this.getTz());
      return n.ms = 0, r.getTime() === n.getTime();
    }
    let t = new m(e, this.getTz());
    return t.ms = 0, t.match(this._states.pattern, this.options);
  }
  getPattern() {
    if (!this._states.once)
      return this._states.pattern ? this._states.pattern.pattern : undefined;
  }
  getOnce() {
    return this._states.once ? this._states.once.getDate() : null;
  }
  isRunning() {
    let e = this.nextRun(this._states.currentRun), t = !this._states.paused, r = this.fn !== undefined, n = !this._states.kill;
    return t && r && n && e !== null;
  }
  isStopped() {
    return this._states.kill;
  }
  isBusy() {
    return this._states.blocking;
  }
  currentRun() {
    return this._states.currentRun ? this._states.currentRun.getDate() : null;
  }
  previousRun() {
    return this._states.previousRun ? this._states.previousRun.getDate() : null;
  }
  msToNext(e) {
    let t = this._next(e);
    return t ? e instanceof m || e instanceof Date ? t.getTime() - e.getTime() : t.getTime() - new m(e).getTime() : null;
  }
  stop() {
    this._states.kill = true, this._states.currentTimeout && clearTimeout(this._states.currentTimeout);
    let e = w.indexOf(this);
    e >= 0 && w.splice(e, 1);
  }
  pause() {
    return this._states.paused = true, !this._states.kill;
  }
  resume() {
    return this._states.paused = false, !this._states.kill;
  }
  schedule(e) {
    if (e && this.fn)
      throw new Error("Cron: It is not allowed to schedule two functions using the same Croner instance.");
    e && (this.fn = e);
    let t = this.msToNext(), r = this.nextRun(this._states.currentRun);
    return t == null || isNaN(t) || r === null ? this : (t > W && (t = W), this._states.currentTimeout = setTimeout(() => this._checkTrigger(r), t), this._states.currentTimeout && this.options.unref && x(this._states.currentTimeout), this);
  }
  async _trigger(e) {
    this._states.blocking = true, this._states.currentRun = new m(undefined, this.getTz());
    try {
      if (this.options.catch)
        try {
          this.fn !== undefined && await this.fn(this, this.options.context);
        } catch (t) {
          if (p(this.options.catch))
            try {
              this.options.catch(t, this);
            } catch {}
        }
      else
        this.fn !== undefined && await this.fn(this, this.options.context);
    } finally {
      this._states.previousRun = new m(e, this.getTz()), this._states.blocking = false;
    }
  }
  async trigger() {
    await this._trigger();
  }
  runsLeft() {
    return this._states.maxRuns;
  }
  _checkTrigger(e) {
    let t = new Date, r = !this._states.paused && t.getTime() >= e.getTime(), n = this._states.blocking && this.options.protect;
    r && !n ? (this._states.maxRuns !== undefined && this._states.maxRuns--, this._trigger()) : r && n && p(this.options.protect) && setTimeout(() => this.options.protect(this), 0), this.schedule();
  }
  _next(e) {
    let t = !!(e || this._states.currentRun), r = false;
    !e && this.options.startAt && this.options.interval && ([e, t] = this._calculatePreviousRun(e, t), r = !e), e = new m(e, this.getTz()), this.options.startAt && e && e.getTime() < this.options.startAt.getTime() && (e = this.options.startAt);
    let n = this._states.once || new m(e, this.getTz());
    return !r && n !== this._states.once && (n = n.increment(this._states.pattern, this.options, t)), this._states.once && this._states.once.getTime() <= e.getTime() || n === null || this._states.maxRuns !== undefined && this._states.maxRuns <= 0 || this._states.kill || this.options.stopAt && n.getTime() >= this.options.stopAt.getTime() ? null : n;
  }
  _previous(e) {
    let t = new m(e, this.getTz());
    this.options.stopAt && t.getTime() > this.options.stopAt.getTime() && (t = this.options.stopAt);
    let r = new m(t, this.getTz());
    return this._states.once ? this._states.once.getTime() < t.getTime() ? this._states.once : null : (r = r.decrement(this._states.pattern, this.options), r === null || this.options.startAt && r.getTime() < this.options.startAt.getTime() ? null : r);
  }
  _calculatePreviousRun(e, t) {
    let r = new m(undefined, this.getTz()), n = e;
    if (this.options.startAt.getTime() <= r.getTime()) {
      n = this.options.startAt;
      let i = n.getTime() + this.options.interval * 1000;
      for (;i <= r.getTime(); )
        n = new m(n, this.getTz()).increment(this._states.pattern, this.options, true), i = n.getTime() + this.options.interval * 1000;
      t = true;
    }
    return n === null && (n = undefined), [n, t];
  }
};

// node_modules/nanoid/index.js
import { webcrypto as crypto } from "node:crypto";

// node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// node_modules/nanoid/index.js
var POOL_SIZE_MULTIPLIER = 128;
var pool;
var poolOffset;
function fillPool(bytes) {
  if (bytes < 0)
    throw new RangeError("Wrong ID size");
  try {
    if (!pool || pool.length < bytes) {
      pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
      crypto.getRandomValues(pool);
      poolOffset = 0;
    } else if (poolOffset + bytes > pool.length) {
      crypto.getRandomValues(pool);
      poolOffset = 0;
    }
  } catch (e) {
    pool = undefined;
    throw e;
  }
  poolOffset += bytes;
}
function nanoid(size = 21) {
  fillPool(size |= 0);
  let id = "";
  for (let i = poolOffset - size;i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63];
  }
  return id;
}

// src/schedule.ts
init_agent_runner();
init_agent_types();

class SubagentScheduler {
  jobs = new Map;
  intervals = new Map;
  store;
  pi;
  ctx;
  manager;
  start(pi, ctx, manager, store) {
    this.pi = pi;
    this.ctx = ctx;
    this.manager = manager;
    this.store = store;
    for (const job of store.list()) {
      if (job.enabled)
        this.scheduleJob(job);
    }
  }
  stop() {
    for (const cron of this.jobs.values())
      cron.stop();
    this.jobs.clear();
    for (const t of this.intervals.values())
      clearTimeout(t);
    this.intervals.clear();
    this.store = undefined;
    this.pi = undefined;
    this.ctx = undefined;
    this.manager = undefined;
  }
  isActive() {
    return this.store !== undefined;
  }
  list() {
    return this.store?.list() ?? [];
  }
  buildJob(input) {
    const detected = SubagentScheduler.detectSchedule(input.schedule);
    return {
      id: nanoid(10),
      name: input.name,
      description: input.description,
      schedule: detected.normalized,
      scheduleType: detected.type,
      intervalMs: detected.intervalMs,
      subagent_type: input.subagent_type,
      prompt: input.prompt,
      model: input.model,
      thinking: input.thinking,
      max_turns: input.max_turns,
      isolated: input.isolated,
      isolation: input.isolation,
      enabled: true,
      createdAt: new Date().toISOString(),
      runCount: 0
    };
  }
  addJob(input) {
    const store = this.requireStore();
    if (store.hasName(input.name)) {
      throw new Error(`A scheduled job named "${input.name}" already exists.`);
    }
    const job = this.buildJob(input);
    store.add(job);
    if (job.enabled)
      this.scheduleJob(job);
    this.emit({ type: "added", job });
    return job;
  }
  removeJob(id) {
    const store = this.requireStore();
    if (!store.get(id))
      return false;
    this.unscheduleJob(id);
    const ok = store.remove(id);
    if (ok)
      this.emit({ type: "removed", jobId: id });
    return ok;
  }
  updateJob(id, patch) {
    const store = this.requireStore();
    const updated = store.update(id, patch);
    if (!updated)
      return;
    this.unscheduleJob(id);
    if (updated.enabled)
      this.scheduleJob(updated);
    this.emit({ type: "updated", job: updated });
    return updated;
  }
  getNextRun(jobId) {
    const cron = this.jobs.get(jobId);
    if (cron)
      return cron.nextRun()?.toISOString();
    const job = this.store?.get(jobId);
    if (!job?.enabled)
      return;
    if (job.scheduleType === "once")
      return job.schedule;
    if (job.scheduleType === "interval" && job.intervalMs) {
      const base = job.lastRun ? new Date(job.lastRun).getTime() : Date.now();
      return new Date(base + job.intervalMs).toISOString();
    }
    return;
  }
  scheduleJob(job) {
    const store = this.store;
    if (!store)
      return;
    try {
      if (job.scheduleType === "interval" && job.intervalMs) {
        const t = setInterval(() => this.executeJob(job.id), job.intervalMs);
        this.intervals.set(job.id, t);
      } else if (job.scheduleType === "once") {
        const target = new Date(job.schedule).getTime();
        const delay = target - Date.now();
        if (delay > 0) {
          const t = setTimeout(() => {
            this.executeJob(job.id);
            store.update(job.id, { enabled: false });
            const updated = store.get(job.id);
            if (updated)
              this.emit({ type: "updated", job: updated });
          }, delay);
          this.intervals.set(job.id, t);
        } else {
          store.update(job.id, { enabled: false, lastStatus: "error" });
          this.emit({ type: "error", jobId: job.id, error: `Scheduled time ${job.schedule} is in the past` });
        }
      } else {
        const cron = new E(job.schedule, () => this.executeJob(job.id));
        this.jobs.set(job.id, cron);
      }
    } catch (err) {
      this.emit({ type: "error", jobId: job.id, error: err instanceof Error ? err.message : String(err) });
    }
  }
  unscheduleJob(id) {
    const cron = this.jobs.get(id);
    if (cron) {
      cron.stop();
      this.jobs.delete(id);
    }
    const t = this.intervals.get(id);
    if (t) {
      clearTimeout(t);
      clearInterval(t);
      this.intervals.delete(id);
    }
  }
  executeJob(id) {
    const store = this.store;
    const pi = this.pi;
    const ctx = this.ctx;
    const manager = this.manager;
    if (!store || !pi || !ctx || !manager)
      return;
    const job = store.get(id);
    if (!job?.enabled)
      return;
    store.update(id, { lastStatus: "running" });
    let resolvedModel;
    if (job.model) {
      const r = resolveModel(job.model, ctx.modelRegistry);
      if (typeof r !== "string")
        resolvedModel = r;
    }
    let agentId;
    try {
      const dispatch = resolveSpawnType(job.subagent_type);
      if (!dispatch.ok)
        throw new Error(dispatch.message);
      agentId = manager.spawn(pi, ctx, dispatch.type, job.prompt, {
        description: job.description,
        isBackground: true,
        bypassQueue: true,
        model: resolvedModel,
        maxTurns: job.max_turns,
        isolated: job.isolated,
        thinkingLevel: job.thinking,
        isolation: job.isolation,
        invocation: {
          thinking: job.thinking,
          maxTurns: normalizeMaxTurns(job.max_turns),
          isolated: job.isolated,
          runInBackground: true,
          isolation: job.isolation
        }
      });
    } catch (err) {
      const error3 = err instanceof Error ? err.message : String(err);
      store.update(id, { lastRun: new Date().toISOString(), lastStatus: "error" });
      this.emit({ type: "error", jobId: id, error: error3 });
      return;
    }
    this.emit({ type: "fired", jobId: id, agentId, name: job.name });
    const finalize = (status) => {
      const next = this.getNextRun(id);
      const current = store.get(id);
      store.update(id, {
        lastRun: new Date().toISOString(),
        lastStatus: status,
        runCount: (current?.runCount ?? 0) + 1,
        nextRun: next
      });
    };
    manager.awaitStartup(agentId).then(() => manager.getRecord(agentId)?.promise).then(() => {
      const r = manager.getRecord(agentId);
      const failed = r?.status === "error" || r?.status === "aborted" || r?.status === "stopped";
      finalize(failed ? "error" : "success");
    }).catch(() => finalize("error"));
  }
  emit(event) {
    if (this.pi)
      this.pi.events.emit("subagents:scheduled", event);
  }
  requireStore() {
    if (!this.store)
      throw new Error("Scheduler not started — no active session.");
    return this.store;
  }
  static detectSchedule(s2) {
    const trimmed = s2.trim();
    const rel = SubagentScheduler.parseRelativeTime(trimmed);
    if (rel !== null)
      return { type: "once", normalized: rel };
    const ivl = SubagentScheduler.parseInterval(trimmed);
    if (ivl !== null)
      return { type: "interval", intervalMs: ivl, normalized: trimmed };
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      const d = new Date(trimmed);
      if (!Number.isNaN(d.getTime())) {
        if (d.getTime() <= Date.now()) {
          throw new Error(`Scheduled time ${d.toISOString()} is in the past.`);
        }
        return { type: "once", normalized: d.toISOString() };
      }
    }
    const cronCheck = SubagentScheduler.validateCronExpression(trimmed);
    if (cronCheck.valid)
      return { type: "cron", normalized: trimmed };
    throw new Error(`Invalid schedule "${s2}". Use 6-field cron (e.g. "0 0 9 * * 1" — 9am every Monday), interval ("5m"/"1h"), or one-shot ("+10m" / ISO).`);
  }
  static validateCronExpression(expr) {
    const fields = expr.trim().split(/\s+/);
    if (fields.length !== 6) {
      return {
        valid: false,
        error: `Cron must have 6 fields (second minute hour dom month dow), got ${fields.length}. Example: "0 0 9 * * 1" for 9am every Monday.`
      };
    }
    try {
      new E(expr, () => {});
      return { valid: true };
    } catch (e) {
      return { valid: false, error: e instanceof Error ? e.message : "Invalid cron expression" };
    }
  }
  static parseRelativeTime(s2) {
    const m2 = s2.match(/^\+(\d+)(s|m|h|d)$/);
    if (!m2)
      return null;
    const ms = parseInt(m2[1], 10) * { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m2[2]];
    return new Date(Date.now() + ms).toISOString();
  }
  static parseInterval(s2) {
    const m2 = s2.match(/^(\d+)(s|m|h|d)$/);
    if (!m2)
      return null;
    return parseInt(m2[1], 10) * { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m2[2]];
  }
}

// src/schedule-store.ts
import { existsSync as existsSync7, mkdirSync as mkdirSync3, readFileSync as readFileSync5, renameSync, unlinkSync, writeFileSync as writeFileSync2 } from "node:fs";
import { dirname as dirname2, join as join9 } from "node:path";
var LOCK_RETRY_MS = 50;
var LOCK_MAX_RETRIES = 100;
function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function acquireLock(lockPath) {
  for (let i = 0;i < LOCK_MAX_RETRIES; i++) {
    try {
      writeFileSync2(lockPath, `${process.pid}`, { flag: "wx" });
      return;
    } catch (e) {
      if (e.code === "EEXIST") {
        try {
          const pid = parseInt(readFileSync5(lockPath, "utf-8"), 10);
          if (pid && !isProcessRunning(pid)) {
            unlinkSync(lockPath);
            continue;
          }
        } catch {}
        const start = Date.now();
        while (Date.now() - start < LOCK_RETRY_MS) {}
        continue;
      }
      throw e;
    }
  }
  throw new Error(`Failed to acquire schedule lock: ${lockPath}`);
}
function releaseLock(lockPath) {
  try {
    unlinkSync(lockPath);
  } catch {}
}
function resolveStorePath(cwd, sessionId) {
  return join9(cwd, ".pi", "subagent-schedules", `${sessionId}.json`);
}

class ScheduleStore {
  filePath;
  lockPath;
  jobs = new Map;
  constructor(filePath) {
    this.filePath = filePath;
    this.lockPath = filePath + ".lock";
    this.load();
  }
  ensureDir() {
    mkdirSync3(dirname2(this.filePath), { recursive: true });
  }
  load() {
    if (!existsSync7(this.filePath))
      return;
    try {
      const data = JSON.parse(readFileSync5(this.filePath, "utf-8"));
      this.jobs.clear();
      for (const j of data.jobs ?? [])
        this.jobs.set(j.id, j);
    } catch {}
  }
  save() {
    const data = { version: 1, jobs: [...this.jobs.values()] };
    const tmp = this.filePath + ".tmp";
    writeFileSync2(tmp, JSON.stringify(data, null, 2));
    renameSync(tmp, this.filePath);
  }
  withLock(fn) {
    this.ensureDir();
    acquireLock(this.lockPath);
    try {
      this.load();
      const result = fn();
      this.save();
      return result;
    } finally {
      releaseLock(this.lockPath);
    }
  }
  list() {
    return [...this.jobs.values()];
  }
  hasName(name, exceptId) {
    for (const j of this.jobs.values()) {
      if (j.id !== exceptId && j.name === name)
        return true;
    }
    return false;
  }
  get(id) {
    return this.jobs.get(id);
  }
  add(job) {
    this.withLock(() => {
      this.jobs.set(job.id, job);
    });
  }
  update(id, patch) {
    if (!this.jobs.has(id))
      return;
    return this.withLock(() => {
      const existing = this.jobs.get(id);
      if (!existing)
        return;
      const updated = { ...existing, ...patch };
      this.jobs.set(id, updated);
      return updated;
    });
  }
  remove(id) {
    if (!this.jobs.has(id))
      return false;
    return this.withLock(() => this.jobs.delete(id));
  }
  deleteFileIfEmpty() {
    if (this.jobs.size === 0 && existsSync7(this.filePath)) {
      try {
        unlinkSync(this.filePath);
      } catch {}
    }
  }
}

// src/settings.ts
init_agent_types();
import { existsSync as existsSync8, mkdirSync as mkdirSync4, readFileSync as readFileSync6, writeFileSync as writeFileSync3 } from "node:fs";
import { dirname as dirname3, join as join10 } from "node:path";
import { getAgentDir as getAgentDir7 } from "@earendil-works/pi-coding-agent";
var VALID_JOIN_MODES = new Set(["async", "group", "smart"]);
var VALID_TOOL_DESCRIPTION_MODES = new Set(["full", "compact", "custom"]);
var VALID_WIDGET_MODES = new Set(["all", "background", "off"]);
var VALID_VIEWER_MARKDOWN_MODES = new Set(["off", "assistant", "all"]);
var VALID_AGENT_MENTION_MODES = new Set(["model", "direct", "off"]);
var MAX_CONCURRENT_CEILING = 1024;
var MAX_TURNS_CEILING = 1e4;
var GRACE_TURNS_CEILING = 1000;
var SUBAGENT_DEPTH_CEILING = 16;
function sanitize(raw) {
  if (!raw || typeof raw !== "object")
    return {};
  const r = raw;
  const out = {};
  if (r.agentOverrides && typeof r.agentOverrides === "object") {
    const overrides = Object.entries(r.agentOverrides).filter((entry) => typeof entry[1] === "object" && entry[1] !== null && typeof entry[1].model === "string").map(([name, override]) => [name, { model: override.model }]);
    if (overrides.length > 0)
      out.agentOverrides = Object.fromEntries(overrides);
  }
  if (Number.isInteger(r.maxConcurrent) && r.maxConcurrent >= 1 && r.maxConcurrent <= MAX_CONCURRENT_CEILING) {
    out.maxConcurrent = r.maxConcurrent;
  }
  if (Number.isInteger(r.maxConcurrentForeground) && r.maxConcurrentForeground >= 0 && r.maxConcurrentForeground <= MAX_CONCURRENT_CEILING) {
    out.maxConcurrentForeground = r.maxConcurrentForeground;
  }
  if (Number.isInteger(r.defaultMaxTurns) && r.defaultMaxTurns >= 0 && r.defaultMaxTurns <= MAX_TURNS_CEILING) {
    out.defaultMaxTurns = r.defaultMaxTurns;
  }
  if (Number.isInteger(r.graceTurns) && r.graceTurns >= 1 && r.graceTurns <= GRACE_TURNS_CEILING) {
    out.graceTurns = r.graceTurns;
  }
  if (Number.isInteger(r.maxSubagentDepth) && r.maxSubagentDepth >= 0 && r.maxSubagentDepth <= SUBAGENT_DEPTH_CEILING) {
    out.maxSubagentDepth = r.maxSubagentDepth;
  }
  if (typeof r.defaultJoinMode === "string" && VALID_JOIN_MODES.has(r.defaultJoinMode)) {
    out.defaultJoinMode = r.defaultJoinMode;
  }
  if (typeof r.backgroundByDefault === "boolean") {
    out.backgroundByDefault = r.backgroundByDefault;
  }
  if (typeof r.schedulingEnabled === "boolean") {
    out.schedulingEnabled = r.schedulingEnabled;
  }
  if (typeof r.scopeModels === "boolean") {
    out.scopeModels = r.scopeModels;
  }
  if (typeof r.strictAgentFiles === "boolean") {
    out.strictAgentFiles = r.strictAgentFiles;
  }
  if (typeof r.disableDefaultAgents === "boolean") {
    out.disableDefaultAgents = r.disableDefaultAgents;
  }
  if (typeof r.toolDescriptionMode === "string" && VALID_TOOL_DESCRIPTION_MODES.has(r.toolDescriptionMode)) {
    out.toolDescriptionMode = r.toolDescriptionMode;
  }
  if (typeof r.fleetView === "boolean") {
    out.fleetView = r.fleetView;
  }
  if (typeof r.agentMentions === "boolean") {
    out.agentMentions = r.agentMentions ? "model" : "off";
  } else if (typeof r.agentMentions === "string" && VALID_AGENT_MENTION_MODES.has(r.agentMentions)) {
    out.agentMentions = r.agentMentions;
  }
  if (typeof r.rememberAgents === "boolean") {
    out.rememberAgents = r.rememberAgents;
  }
  if (typeof r.widgetMode === "string" && VALID_WIDGET_MODES.has(r.widgetMode)) {
    out.widgetMode = r.widgetMode;
  }
  if (typeof r.outputTranscript === "boolean") {
    out.outputTranscript = r.outputTranscript;
  }
  if (typeof r.worktreeIsolation === "boolean") {
    out.worktreeIsolation = r.worktreeIsolation;
  }
  if (typeof r.reportUsage === "boolean") {
    out.reportUsage = r.reportUsage;
  }
  if (typeof r.showCost === "boolean") {
    out.showCost = r.showCost;
  }
  if (typeof r.showModel === "boolean") {
    out.showModel = r.showModel;
  }
  if (typeof r.viewerMarkdown === "string" && VALID_VIEWER_MARKDOWN_MODES.has(r.viewerMarkdown)) {
    out.viewerMarkdown = r.viewerMarkdown;
  }
  if (typeof r.workflowsEnabled === "boolean") {
    out.workflowsEnabled = r.workflowsEnabled;
  }
  if (r.fallbackSubagent === false) {
    out.fallbackSubagent = NO_FALLBACK;
  } else if (typeof r.fallbackSubagent === "string" && r.fallbackSubagent.trim()) {
    out.fallbackSubagent = r.fallbackSubagent.trim();
  }
  return out;
}
function globalPath() {
  return join10(getAgentDir7(), "subagents.json");
}
function piSettingsPath() {
  return join10(getAgentDir7(), "settings.json");
}
function projectPath(cwd) {
  return join10(cwd, ".pi", "subagents.json");
}
function readSettingsFile(path) {
  if (!existsSync8(path))
    return {};
  try {
    return sanitize(JSON.parse(readFileSync6(path, "utf-8")));
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[pi-subagents] Ignoring malformed settings at ${path}: ${reason}`);
    return {};
  }
}
function readPiSettingsFile(path) {
  if (!existsSync8(path))
    return {};
  try {
    const root = JSON.parse(readFileSync6(path, "utf-8"));
    return sanitize(root.subagents);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[pi-subagents] Ignoring malformed Pi settings at ${path}: ${reason}`);
    return {};
  }
}
function loadSettings(cwd = process.cwd()) {
  const global = readSettingsFile(globalPath());
  const piSettings = readPiSettingsFile(piSettingsPath());
  const project = readSettingsFile(projectPath(cwd));
  const agentOverrides2 = {
    ...global.agentOverrides,
    ...piSettings.agentOverrides,
    ...project.agentOverrides
  };
  return {
    ...global,
    ...piSettings,
    ...project,
    ...Object.keys(agentOverrides2).length > 0 ? { agentOverrides: agentOverrides2 } : {}
  };
}
function saveSettings(s2, cwd = process.cwd()) {
  const path = projectPath(cwd);
  try {
    mkdirSync4(dirname3(path), { recursive: true });
    writeFileSync3(path, JSON.stringify(s2, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}
function applySettings(s2, appliers) {
  if (s2.agentOverrides)
    appliers.setAgentOverrides(s2.agentOverrides);
  if (typeof s2.maxConcurrent === "number")
    appliers.setMaxConcurrent(s2.maxConcurrent);
  if (typeof s2.maxConcurrentForeground === "number") {
    appliers.setMaxConcurrentForeground(s2.maxConcurrentForeground);
  }
  if (typeof s2.defaultMaxTurns === "number")
    appliers.setDefaultMaxTurns(s2.defaultMaxTurns);
  if (typeof s2.graceTurns === "number")
    appliers.setGraceTurns(s2.graceTurns);
  if (typeof s2.maxSubagentDepth === "number")
    appliers.setMaxSubagentDepth(s2.maxSubagentDepth);
  if (typeof s2.fallbackSubagent === "string")
    appliers.setFallbackSubagent(s2.fallbackSubagent);
  if (s2.defaultJoinMode)
    appliers.setDefaultJoinMode(s2.defaultJoinMode);
  if (typeof s2.backgroundByDefault === "boolean")
    appliers.setBackgroundByDefault(s2.backgroundByDefault);
  if (typeof s2.schedulingEnabled === "boolean")
    appliers.setSchedulingEnabled(s2.schedulingEnabled);
  if (typeof s2.scopeModels === "boolean")
    appliers.setScopeModels(s2.scopeModels);
  if (typeof s2.strictAgentFiles === "boolean")
    appliers.setStrictAgentFiles(s2.strictAgentFiles);
  if (typeof s2.disableDefaultAgents === "boolean")
    appliers.setDisableDefaultAgents(s2.disableDefaultAgents);
  if (s2.toolDescriptionMode)
    appliers.setToolDescriptionMode(s2.toolDescriptionMode);
  if (typeof s2.fleetView === "boolean")
    appliers.setFleetView(s2.fleetView);
  if (s2.agentMentions)
    appliers.setAgentMentions(s2.agentMentions);
  if (typeof s2.rememberAgents === "boolean")
    appliers.setRememberAgents(s2.rememberAgents);
  if (s2.widgetMode)
    appliers.setWidgetMode(s2.widgetMode);
  if (typeof s2.outputTranscript === "boolean")
    appliers.setOutputTranscript(s2.outputTranscript);
  if (typeof s2.worktreeIsolation === "boolean")
    appliers.setWorktreeIsolation(s2.worktreeIsolation);
  if (typeof s2.reportUsage === "boolean")
    appliers.setReportUsage(s2.reportUsage);
  if (typeof s2.showCost === "boolean")
    appliers.setShowCost(s2.showCost);
  if (typeof s2.showModel === "boolean")
    appliers.setShowModel(s2.showModel);
  if (s2.viewerMarkdown)
    appliers.setViewerMarkdown(s2.viewerMarkdown);
  if (typeof s2.workflowsEnabled === "boolean")
    appliers.setWorkflowsEnabled(s2.workflowsEnabled);
}
function persistToastFor(successMsg, persisted) {
  return persisted ? { message: successMsg, level: "info" } : { message: `${successMsg} (session only; failed to persist)`, level: "warning" };
}
function applyAndEmitLoaded(appliers, emit, cwd = process.cwd()) {
  const settings = loadSettings(cwd);
  applySettings(settings, appliers);
  emit("subagents:settings_loaded", { settings });
  return settings;
}
function saveAndEmitChanged(snapshot, successMsg, emit, cwd = process.cwd()) {
  const persisted = saveSettings(snapshot, cwd);
  emit("subagents:settings_changed", { settings: snapshot, persisted });
  return persistToastFor(successMsg, persisted);
}
// src/ui/agent-mention.ts
init_mention();
function mentionRoster(manager, types, displayNameOf = (type4) => type4) {
  const live = (r) => r.status === "running" || r.status === "queued";
  const records = manager.listAgents().filter((r) => r.handle !== undefined && r.parentAgentId === undefined).sort((a, b2) => Number(live(b2)) - Number(live(a)) || a.startedAt - b2.startedAt);
  const taken = new Set;
  const targets = [];
  for (const record3 of records) {
    const handle = record3.alias ?? record3.handle;
    taken.add(handle.toLowerCase());
    if (record3.handle)
      taken.add(record3.handle.toLowerCase());
    targets.push({ kind: "record", handle, record: record3, typeLabel: displayNameOf(record3.type) });
  }
  for (const entry of manager.listTombstones()) {
    const handle = entry.alias ?? entry.handle;
    if (taken.has(handle.toLowerCase()))
      continue;
    taken.add(handle.toLowerCase());
    taken.add(entry.handle.toLowerCase());
    targets.push({ kind: "tombstone", handle, entry, typeLabel: displayNameOf(entry.type) });
  }
  for (const type4 of types) {
    const handle = handleBase(type4.name);
    if (taken.has(handle))
      continue;
    taken.add(handle);
    targets.push({ kind: "type", handle, type: type4.name, description: type4.description });
  }
  return targets;
}
function createMentionProvider(current, roster, isEnabled) {
  let warnedInnerFailure = false;
  return {
    triggerCharacters: ["@"],
    async getSuggestions(lines, cursorLine, cursorCol, options) {
      const mine = isEnabled() ? mentionItems(roster(), lines[cursorLine] ?? "", cursorCol) : null;
      let theirs = null;
      try {
        theirs = await current.getSuggestions(lines, cursorLine, cursorCol, options);
      } catch (err) {
        if (!warnedInnerFailure) {
          warnedInnerFailure = true;
          console.warn("[pi-subagents] the autocomplete provider below us failed; showing agent rows only:", err);
        }
        theirs = null;
      }
      if (!mine)
        return theirs;
      if (!theirs)
        return mine;
      return { items: [...mine.items, ...theirs.items], prefix: mine.prefix };
    },
    applyCompletion(lines, cursorLine, cursorCol, item, prefix) {
      return current.applyCompletion(lines, cursorLine, cursorCol, item, prefix);
    },
    shouldTriggerFileCompletion(lines, cursorLine, cursorCol) {
      return current.shouldTriggerFileCompletion?.(lines, cursorLine, cursorCol) ?? true;
    }
  };
}
function mentionItems(roster, line, cursorCol) {
  const match = MENTION_TRIGGER.exec(line.slice(0, cursorCol));
  if (!match)
    return null;
  const typed = match[2].toLowerCase();
  const items = [];
  for (const target of roster) {
    if (!target.handle.toLowerCase().startsWith(typed))
      continue;
    items.push({ value: `@${target.handle}`, label: `@${target.handle}`, description: describeTarget(target) });
  }
  return items.length > 0 ? { items, prefix: `@${match[2]}` } : null;
}
function describeTarget(target) {
  if (target.kind === "type")
    return `start agent · ${summarize(target.description)}`;
  if (target.kind === "tombstone") {
    return `resume · ${target.typeLabel} · ${target.entry.description}`;
  }
  const { status, description, alias } = target.record;
  const action = status === "running" || status === "queued" ? "send message" : "resume";
  const identity = alias ? `${target.typeLabel} · ` : "";
  return `${action} · ${identity}${status} · ${description}`;
}
function summarize(description) {
  const first = (description.match(/^.*?[.!?](?=\s|$)/s)?.[0] ?? description).replace(/\s+/g, " ").trim();
  return first.length > 60 ? `${first.slice(0, 59).trimEnd()}…` : first;
}

// src/index.ts
init_agent_widget();

// src/ui/fleet-list.ts
init_agent_color();
init_agent_manager();
init_agent_widget();
init_conversation_viewer();
import { Editor, isKeyRelease, Key, matchesKey as matchesKey3, truncateToWidth as truncateToWidth3, visibleWidth as visibleWidth2 } from "@earendil-works/pi-tui";
var FLEET_KEY = "fleet";
var MAX_AGENT_ROWS = 5;
var TICK_MS = 200;
var FINISHED_LINGER_MS = 4000;
function formatFleetElapsed(ms) {
  return `${Math.max(0, Math.round(ms / 1000))}s`;
}
function formatFleetTokens(count) {
  let compact;
  if (count >= 1e6)
    compact = `${(count / 1e6).toFixed(1)}M`;
  else if (count >= 1000)
    compact = `${(count / 1000).toFixed(1)}k`;
  else
    compact = `${count}`;
  return `↓ ${compact} tokens`;
}
function rightAlign(left, right, width) {
  const rightW = visibleWidth2(right);
  const maxLeft = Math.max(0, width - rightW - 1);
  const leftClamped = truncateToWidth3(left, maxLeft);
  const gap = Math.max(1, width - visibleWidth2(leftClamped) - rightW);
  return truncateToWidth3(leftClamped + " ".repeat(gap) + right, width);
}

class FleetList {
  manager;
  agentActivity;
  showCost;
  viewerMarkdown;
  onViewerMarkdown;
  ui;
  tui;
  inputUnsub;
  widgetRegistered = false;
  timer;
  enabled = true;
  active = false;
  selectedIndex = 0;
  viewerClose;
  viewingAgentId;
  workflowSource;
  openWorkflow;
  viewingWorkflowId;
  constructor(manager, agentActivity, showCost = () => false, viewerMarkdown, onViewerMarkdown) {
    this.manager = manager;
    this.agentActivity = agentActivity;
    this.showCost = showCost;
    this.viewerMarkdown = viewerMarkdown;
    this.onViewerMarkdown = onViewerMarkdown;
  }
  setEnabled(enabled) {
    if (enabled === this.enabled)
      return;
    this.enabled = enabled;
    if (!enabled)
      this.active = false;
    this.update();
  }
  setUICtx(ui) {
    if (ui === this.ui)
      return;
    this.inputUnsub?.();
    this.ui = ui;
    this.widgetRegistered = false;
    this.tui = undefined;
    this.inputUnsub = ui.onTerminalInput((data) => this.handleKey(data));
  }
  ensureTimer() {
    if (!this.timer)
      this.timer = setInterval(() => this.update(), TICK_MS);
  }
  onAgentFinished(_id) {
    this.update();
  }
  dispose() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    this.inputUnsub?.();
    this.inputUnsub = undefined;
    if (this.viewerClose) {
      this.viewerClose();
      this.viewerClose = undefined;
    }
    this.viewingAgentId = undefined;
    this.viewingWorkflowId = undefined;
    if (this.ui && this.widgetRegistered)
      this.ui.setWidget(FLEET_KEY, undefined);
    this.widgetRegistered = false;
    this.tui = undefined;
    this.active = false;
    this.ui = undefined;
  }
  update() {
    if (!this.ui)
      return;
    const hasRows = this.enabled && this.roster().length > 1;
    if (!hasRows) {
      if (this.widgetRegistered) {
        this.ui.setWidget(FLEET_KEY, undefined);
        this.widgetRegistered = false;
        this.tui = undefined;
      }
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = undefined;
      }
      this.active = false;
      this.selectedIndex = 0;
      return;
    }
    this.clampSelection();
    this.ensureTimer();
    if (!this.widgetRegistered) {
      this.ui.setWidget(FLEET_KEY, (tui, theme) => {
        this.tui = tui;
        return {
          render: (w2) => this.renderBar(w2, theme),
          invalidate: () => {
            this.widgetRegistered = false;
            this.tui = undefined;
          }
        };
      }, { placement: "belowEditor" });
      this.widgetRegistered = true;
    } else {
      this.tui?.requestRender();
    }
  }
  agentRecords() {
    const now = Date.now();
    return this.manager.listAgents().filter((a) => isTopLevelAgent(a) && a.session && (a.status === "running" || a.status === "queued" || a.id === this.viewingAgentId || a.completedAt != null && now - a.completedAt < FINISHED_LINGER_MS)).sort((a, b2) => a.startedAt - b2.startedAt);
  }
  setWorkflowSource(source, open) {
    this.workflowSource = source;
    this.openWorkflow = open;
  }
  workflows() {
    if (!this.workflowSource)
      return [];
    const now = Date.now();
    return [...this.workflowSource()].filter((run) => run.status === "running" || run.status === "paused" || run.completedAt != null && now - run.completedAt < FINISHED_LINGER_MS).sort((a, b2) => a.startedAt - b2.startedAt);
  }
  roster() {
    return [
      { kind: "main" },
      ...this.workflows().map((workflow) => ({ kind: "workflow", workflow })),
      ...this.agentRecords().map((record3) => ({ kind: "agent", record: record3 }))
    ];
  }
  clampSelection() {
    const max = this.roster().length - 1;
    if (this.selectedIndex > max)
      this.selectedIndex = Math.max(0, max);
    if (this.selectedIndex < 0)
      this.selectedIndex = 0;
  }
  handleKey(data) {
    if (!this.enabled || !this.ui)
      return;
    if (isKeyRelease(data))
      return;
    if (this.viewerClose || this.viewingWorkflowId)
      return;
    if (!this.editorHasFocus()) {
      if (this.active)
        this.deactivate();
      return;
    }
    if (!this.active) {
      const isActivator = matchesKey3(data, "down") || matchesKey3(data, "left");
      if (isActivator && this.roster().length > 1 && this.ui.getEditorText() === "") {
        this.active = true;
        this.selectedIndex = 0;
        this.update();
        return { consume: true };
      }
      return;
    }
    if (matchesKey3(data, "down")) {
      const max = this.roster().length - 1;
      this.selectedIndex = Math.min(max, this.selectedIndex + 1);
      this.update();
      return { consume: true };
    }
    if (matchesKey3(data, "up")) {
      if (this.selectedIndex === 0) {
        this.deactivate();
        return { consume: true };
      }
      this.selectedIndex -= 1;
      this.update();
      return { consume: true };
    }
    if (matchesKey3(data, "escape")) {
      this.deactivate();
      return { consume: true };
    }
    if (matchesKey3(data, Key.enter)) {
      this.openSelected();
      return { consume: true };
    }
    this.deactivate();
    return;
  }
  editorHasFocus() {
    const focused = this.tui?.focusedComponent;
    return focused == null || focused instanceof Editor;
  }
  deactivate() {
    this.active = false;
    this.selectedIndex = 0;
    this.update();
  }
  openSelected() {
    const entry = this.roster()[this.selectedIndex];
    if (!entry || entry.kind === "main") {
      this.deactivate();
      return;
    }
    if (entry.kind === "workflow") {
      this.viewingWorkflowId = entry.workflow.id;
      Promise.resolve(this.openWorkflow?.(entry.workflow.id)).then(() => this.clearViewer(), () => this.clearViewer());
      return;
    }
    const record3 = entry.record;
    if (!this.ui)
      return;
    if (!record3.session) {
      this.ui.notify(`Agent is ${record3.status} — no session available.`, "info");
      return;
    }
    const session = record3.session;
    const activity = this.agentActivity.get(record3.id);
    this.viewingAgentId = record3.id;
    this.ui.custom((tui, theme, keybindings, done) => {
      this.viewerClose = () => done(undefined);
      return new ConversationViewer(tui, session, record3, activity, theme, done, () => {
        if (this.manager.abort(record3.id))
          this.ui?.notify(`Stopped "${record3.description}".`, "info");
      }, keybindings, (message) => this.manager.steer(record3.id, message), this.showCost(), this.viewerMarkdown, this.onViewerMarkdown);
    }, {
      overlay: true,
      overlayOptions: { anchor: "center", width: "90%", maxHeight: `${VIEWPORT_HEIGHT_PCT}%` }
    }).then(() => this.clearViewer(), () => this.clearViewer());
  }
  clearViewer() {
    const viewed = this.viewingAgentId ?? this.viewingWorkflowId;
    if (viewed !== undefined) {
      const idx = this.roster().findIndex((e) => e.kind === "agent" ? e.record.id === viewed : e.kind === "workflow" ? e.workflow.id === viewed : false);
      if (idx >= 0)
        this.selectedIndex = idx;
    }
    this.viewerClose = undefined;
    this.viewingAgentId = undefined;
    this.viewingWorkflowId = undefined;
    this.update();
  }
  renderBar(width, theme) {
    const rows = this.roster().slice(1);
    if (rows.length === 0)
      return [];
    const sel = Math.min(this.selectedIndex, rows.length);
    const hint = this.active ? "↑↓ select · enter view · esc back" : "esc to interrupt · ← for agents · ↓ to manage";
    const lines = [];
    lines.push(truncateToWidth3("  " + theme.fg("dim", hint), width));
    lines.push("");
    lines.push(truncateToWidth3(`  ${this.bullet(0, sel, theme)} main`, width));
    const visible = Math.min(MAX_AGENT_ROWS, rows.length);
    const selRow = Math.max(0, sel - 1);
    const start = selRow < visible ? 0 : selRow - visible + 1;
    const hiddenBelow = rows.length - (start + visible);
    if (start > 0)
      lines.push(rightAlign("", theme.fg("dim", `↑ ${start} more`), width));
    for (let a = start;a < start + visible; a++) {
      const row = rows[a];
      lines.push(row.kind === "workflow" ? this.renderWorkflowRow(a + 1, sel, row.workflow, width, theme) : this.renderAgentRow(a + 1, sel, row.record, width, theme));
    }
    if (hiddenBelow > 0)
      lines.push(rightAlign("", theme.fg("dim", `↓ ${hiddenBelow} more`), width));
    return lines;
  }
  bullet(rosterIndex, sel, theme) {
    return rosterIndex === sel ? theme.fg("accent", "●") : theme.fg("dim", "○");
  }
  renderWorkflowRow(rosterIndex, sel, workflow, width, theme) {
    const selected = rosterIndex === sel;
    const kind = theme.fg(selected ? "text" : "muted", "workflow");
    const name = selected ? theme.fg("text", workflow.name) : workflow.name;
    const left = `  ${this.bullet(rosterIndex, sel, theme)} ${kind}  ${name}`;
    const elapsed = (workflow.completedAt ?? Date.now()) - workflow.startedAt;
    const agents2 = `${workflow.doneCount}/${workflow.totalCount} agent${workflow.totalCount === 1 ? "" : "s"}`;
    const stats = `${agents2} · ${formatFleetElapsed(elapsed)} · ${formatFleetTokens(workflow.tokens)}`;
    return rightAlign(left, selected ? theme.fg("text", stats) : theme.fg("dim", stats), width);
  }
  renderAgentRow(rosterIndex, sel, record3, width, theme) {
    const selected = rosterIndex === sel;
    const name = renderAgentName(record3.type, theme, selected ? { fallbackColor: "text", bold: hasAgentBadge(record3.type) } : { fallbackColor: "muted" });
    const description = selected ? theme.fg("text", record3.description) : record3.description;
    const left = `  ${this.bullet(rosterIndex, sel, theme)} ${name}  ${description}`;
    const tokens = getLifetimeTotal(record3.lifetimeUsage);
    const elapsedMs = (record3.completedAt ?? Date.now()) - record3.startedAt;
    const cost = this.showCost() ? formatCost(getLifetimeCost(record3.lifetimeUsage)) : "";
    const stats = `${formatFleetElapsed(elapsedMs)} · ${formatFleetTokens(tokens)}${cost ? ` · ${cost}` : ""}`;
    const right = selected ? theme.fg("text", stats) : theme.fg("dim", stats);
    return rightAlign(left, right, width);
  }
}

// src/ui/select-item.ts
async function selectItem(ui, title, items, format) {
  const width = String(items.length).length;
  const rows = items.map((item, i) => ({
    item,
    label: `${String(i + 1).padStart(width)}. ${format(item, i)}`
  }));
  const choice = await ui.select(title, rows.map((r) => r.label));
  if (!choice)
    return;
  return rows.find((r) => r.label === choice)?.item;
}

// src/ui/schedule-menu.ts
function relTime(iso, now = Date.now()) {
  if (!iso)
    return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t))
    return "—";
  const diff = t - now;
  const abs = Math.abs(diff);
  const future = diff > 0;
  if (abs < 60000)
    return future ? "in <1m" : "<1m ago";
  const m2 = Math.round(abs / 60000);
  if (m2 < 60)
    return future ? `in ${m2}m` : `${m2}m ago`;
  const h = Math.round(abs / 3600000);
  if (h < 24)
    return future ? `in ${h}h` : `${h}h ago`;
  const d = Math.round(abs / 86400000);
  return future ? `in ${d}d` : `${d}d ago`;
}
function statusIcon(j) {
  if (!j.enabled)
    return "✗";
  if (j.lastStatus === "error")
    return "!";
  if (j.lastStatus === "running")
    return "⋯";
  return "✓";
}
function formatJob(j, scheduler) {
  const next = scheduler.getNextRun(j.id);
  return [
    statusIcon(j),
    j.name.padEnd(18).slice(0, 18),
    j.schedule.padEnd(14).slice(0, 14),
    `[${j.subagent_type}]`,
    `next ${relTime(next)}`,
    `last ${relTime(j.lastRun)}`,
    `runs ${j.runCount}`
  ].join("  ");
}
function formatDetails(j, scheduler) {
  const next = scheduler.getNextRun(j.id) ?? "—";
  return [
    `name:      ${j.name}`,
    `schedule:  ${j.schedule} (${j.scheduleType})`,
    `agent:     ${j.subagent_type}`,
    `prompt:    ${j.prompt.slice(0, 200)}${j.prompt.length > 200 ? "…" : ""}`,
    `created:   ${j.createdAt}`,
    `last run:  ${j.lastRun ?? "—"} (${j.lastStatus ?? "—"})`,
    `next run:  ${next}`,
    `runs:      ${j.runCount}`
  ].join(`
`);
}
async function showSchedulesMenu(ctx, scheduler) {
  if (!scheduler.isActive()) {
    ctx.ui.notify("Scheduler is not active in this session.", "warning");
    return;
  }
  const jobs = scheduler.list();
  if (jobs.length === 0) {
    ctx.ui.notify("No scheduled jobs.", "info");
    return;
  }
  const job = await selectItem(ctx.ui, `Scheduled jobs (${jobs.length}) — select to cancel`, jobs, (j) => formatJob(j, scheduler));
  if (!job)
    return;
  const ok = await ctx.ui.confirm(`Cancel "${job.name}"?`, formatDetails(job, scheduler));
  if (!ok)
    return;
  scheduler.removeJob(job.id);
  ctx.ui.notify(`Cancelled "${job.name}".`, "info");
}

// src/ui/workflow-card.ts
import { stripTerminalSequences, Text, truncateToWidth as truncateToWidth4, visibleWidth as visibleWidth3 } from "@earendil-works/pi-tui";

// src/workflow/progress.ts
function collapse(progress) {
  const agents2 = new Map;
  const logs = [];
  const phaseTitles = new Map;
  for (const entry of progress) {
    if (entry.type === "workflow_agent")
      agents2.set(entry.index, entry);
    else if (entry.type === "workflow_log")
      logs.push(entry.message);
    else
      phaseTitles.set(entry.index, entry.title);
  }
  return {
    agents: [...agents2.values()].sort((a, b2) => a.index - b2.index),
    logs,
    phaseTitles
  };
}
function displayState(entry, workflowActive) {
  if (entry.state === "done")
    return "done";
  if (entry.state === "error") {
    if (entry.skipped)
      return "skipped";
    if (entry.blocked)
      return "blocked";
    return "failed";
  }
  if (!workflowActive)
    return "interrupted";
  return entry.queuedAt != null && entry.startedAt == null ? "queued" : "running";
}
function isLive(entry) {
  return entry.state === "start" || entry.state === "progress";
}
function groupByPhase(agents2, phaseTitles) {
  if (!agents2.some((a) => a.phaseIndex != null))
    return null;
  const byPhase = new Map;
  for (const agent of agents2) {
    const phaseIndex = agent.phaseIndex ?? 0;
    let group = byPhase.get(phaseIndex);
    if (!group) {
      group = { phaseIndex, title: phaseTitles.get(phaseIndex) ?? `Phase ${phaseIndex}`, agents: [] };
      byPhase.set(phaseIndex, group);
    }
    group.agents.push(agent);
  }
  return [...byPhase.values()].sort((a, b2) => a.phaseIndex - b2.phaseIndex);
}
function summarize2(group) {
  let done = 0;
  let failed = 0;
  let tokens = 0;
  let minStart = Number.POSITIVE_INFINITY;
  let maxProgress = 0;
  for (const agent of group.agents) {
    if (agent.state === "done")
      done++;
    else if (agent.state === "error")
      failed++;
    if (agent.tokens)
      tokens += agent.tokens;
    if (agent.startedAt != null) {
      if (agent.startedAt < minStart)
        minStart = agent.startedAt;
      const last = agent.lastProgressAt ?? agent.startedAt;
      if (last > maxProgress)
        maxProgress = last;
    }
  }
  const total = group.agents.length;
  const finished = done + failed === total && total > 0;
  return {
    title: group.title,
    status: finished ? failed > 0 ? "failed" : "done" : "running",
    agents: group.agents,
    doneCount: done,
    totalCount: total,
    tokens,
    durationMs: minStart < Number.POSITIVE_INFINITY ? maxProgress - minStart : 0
  };
}
function placeholder(title) {
  return { title, status: "not-started", agents: [], doneCount: 0, totalCount: 0, tokens: 0, durationMs: 0 };
}
var normalizeTitle = (title) => title.toLowerCase().trim();
function mergePhases(declared, observed) {
  const consumed = new Set;
  const merged = [];
  for (const phase of declared ?? []) {
    const wanted = normalizeTitle(phase.title);
    const match = observed.find((group) => {
      if (consumed.has(group))
        return false;
      const actual = normalizeTitle(group.title);
      return actual === wanted || actual.startsWith(wanted) || wanted.startsWith(actual);
    });
    if (match) {
      consumed.add(match);
      merged.push(summarize2(match));
    } else {
      merged.push(placeholder(phase.title));
    }
  }
  for (const group of observed) {
    if (!consumed.has(group))
      merged.push(summarize2(group));
  }
  return merged;
}
function buildPhaseGroups(progress, declared) {
  const { agents: agents2, phaseTitles } = collapse(progress);
  const observed = groupByPhase(agents2, phaseTitles) ?? [];
  const merged = mergePhases(declared, observed);
  if (merged.length === 0 && agents2.length > 0) {
    return [summarize2({ title: "Agents", agents: agents2 })];
  }
  if (agents2.length > 0 && !merged.some((group) => group.totalCount > 0)) {
    return [...merged, summarize2({ title: "Agents", agents: agents2 })];
  }
  return merged;
}
function stats(progress, agentCount = 0) {
  let seen = 0;
  let done = 0;
  let failed = 0;
  let started = 0;
  let anyLive = false;
  for (const entry of progress) {
    if (entry.type !== "workflow_agent")
      continue;
    seen++;
    if (entry.state === "done") {
      done++;
      started++;
    } else if (entry.state === "error") {
      failed++;
      started++;
    } else {
      anyLive = true;
      if (entry.startedAt !== undefined || entry.queuedAt === undefined)
        started++;
    }
  }
  const total = Math.max(agentCount, seen);
  return {
    done,
    failedCount: failed,
    running: anyLive,
    total,
    started,
    complete: !anyLive && seen > 0 && done + failed >= total
  };
}
function elapsedMs(task, now) {
  return Math.max(0, (task.endTime ?? now) - task.startTime - (task.totalPausedMs ?? 0));
}
var plural = (n, word) => n === 1 ? word : `${word}s`;
function formatDuration2(ms) {
  if (ms < 1000)
    return `${Math.max(0, Math.round(ms))}ms`;
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0)
    return `${seconds}s`;
  return `${minutes}m${seconds.toString().padStart(2, "0")}s`;
}
function header(task, meta, groups, agentCount, now) {
  const suffix = task.status === "completed" ? " · done" : task.status === "killed" ? " · stopped" : task.status === "paused" ? " · paused" : task.status === "failed" ? " · failed" : "";
  let doneAgents = 0;
  let totalAgents = 0;
  for (const group of groups) {
    doneAgents += group.doneCount;
    totalAgents += group.totalCount;
  }
  totalAgents = Math.max(agentCount, totalAgents, doneAgents);
  return {
    name: task.workflowName ?? meta?.name ?? task.summary ?? task.description ?? "workflow",
    subtext: meta?.description ?? task.description ?? task.summary ?? "",
    stats: `${doneAgents}/${totalAgents} ${plural(totalAgents, "agent")} · ${formatDuration2(elapsedMs(task, now))}${suffix}`
  };
}
var DEFAULT_AGENT_CAP = 25;
var DEFAULT_TOKEN_CAP = 1500000;
var ASSUMED_TOKENS_PER_AGENT = 70000;
function sizeWarning(input) {
  const agentCap = input.agentCap ?? DEFAULT_AGENT_CAP;
  const tokenCap = input.tokenCap ?? DEFAULT_TOKEN_CAP;
  const perAgent = input.startedAgents > 0 ? input.totalTokens / input.startedAgents : ASSUMED_TOKENS_PER_AGENT;
  const projectedTokens = Math.max(input.totalTokens, Math.round(perAgent * input.scheduledAgents));
  const overAgents = input.scheduledAgents > agentCap;
  const overTokens = input.totalTokens > tokenCap || projectedTokens > tokenCap;
  if (!overAgents && !overTokens)
    return;
  return {
    axis: overAgents && overTokens ? "both" : overAgents ? "agents" : "tokens",
    scheduledAgents: input.scheduledAgents,
    totalTokens: input.totalTokens,
    projectedTokens,
    agentCap,
    tokenCap
  };
}
var GERUND_OVERRIDES = new Map([
  ["commit", "committing"],
  ["submit", "submitting"],
  ["format", "formatting"],
  ["setup", null],
  ["cleanup", null]
]);

// src/ui/workflow-card.ts
var LABEL_COLUMN_MAX = 28;
var DEFAULT_WIDTH = 80;
var UNICODE_GLYPHS = {
  pointer: "▸",
  tick: "✔",
  cross: "✘",
  running: "⟳",
  groupTop: "╭─",
  groupMid: "├─",
  groupBottom: "╰─",
  vertical: "│",
  branch: "├─",
  lastBranch: "└─",
  log: "⎿",
  warning: "⚠"
};
var ASCII_GLYPHS = {
  pointer: ">",
  tick: "√",
  cross: "×",
  running: "*",
  groupTop: ",-",
  groupMid: "|-",
  groupBottom: "`-",
  vertical: "|",
  branch: "|-",
  lastBranch: "`-",
  log: "\\",
  warning: "!"
};
function formatCompactTokens(count) {
  if (count >= 1e6)
    return `${(count / 1e6).toFixed(1)}M`;
  if (count >= 1000)
    return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
}
function formatModel(entry, opts) {
  const { fallbackModel, requestedModel } = entry;
  const model = opts?.canonical ? entry.modelId ?? entry.model : entry.model;
  const primary = model && fallbackModel && model !== fallbackModel ? `${model}→${fallbackModel}` : model ?? fallbackModel;
  if (primary === undefined)
    return;
  return requestedModel !== undefined && requestedModel !== primary ? `${primary} (asked ${requestedModel})` : primary;
}
function formatThinking(entry) {
  const { thinking, requestedThinking } = entry;
  if (!thinking)
    return;
  return requestedThinking !== undefined && requestedThinking !== thinking ? `thinking: ${thinking} (asked ${requestedThinking})` : `thinking: ${thinking}`;
}
var REPLAYED_ANNOTATION = "from resume journal";
function agentStatSegments(entry) {
  const parts = [];
  if (entry.agentType)
    parts.push(entry.agentType);
  const model = formatModel(entry);
  if (model)
    parts.push(model);
  if (entry.tokens)
    parts.push(formatCompactTokens(entry.tokens));
  if (entry.toolCalls)
    parts.push(`${entry.toolCalls} tool call${entry.toolCalls === 1 ? "" : "s"}`);
  if (entry.durationMs)
    parts.push(formatDuration2(entry.durationMs));
  return parts;
}
function rowGlyph(entry, glyphs) {
  if (entry.state === "done")
    return { text: glyphs.tick, color: "success" };
  if (entry.state === "error")
    return { text: glyphs.cross, color: "error" };
  return { text: glyphs.running };
}
function clampLine(line, width) {
  const clamped = [];
  let used = 0;
  for (const segment of line) {
    const segmentWidth = visibleWidth3(segment.text);
    if (used + segmentWidth <= width) {
      clamped.push(segment);
      used += segmentWidth;
      continue;
    }
    const room = width - used;
    if (room > 0) {
      clamped.push({ ...segment, text: stripTerminalSequences(truncateToWidth4(segment.text, room, "…")) });
    }
    return clamped;
  }
  return clamped;
}
var lineWidth = (line) => line.reduce((sum, s2) => sum + visibleWidth3(s2.text), 0);
function layoutWorkflowCard(input) {
  const glyphs = input.ascii ? ASCII_GLYPHS : UNICODE_GLYPHS;
  const width = Math.max(1, input.width ?? DEFAULT_WIDTH);
  const now = input.now ?? Date.now();
  const groups = buildPhaseGroups(input.progress, input.meta?.phases);
  const { agents: agents2, logs } = collapse(input.progress);
  const totals = stats(input.progress, input.agentCount ?? 0);
  const head = header(input.task, input.meta, groups, input.agentCount ?? 0, now);
  const lines = [];
  const left = input.showToolTitle ? [
    { text: `${glyphs.pointer} `, color: "toolTitle" },
    { text: "SubagentWorkflow", color: "toolTitle", bold: true },
    { text: "  " },
    { text: head.name, color: "muted" }
  ] : [{ text: "  " }, { text: head.name, color: "toolTitle", bold: true }];
  const statsWidth = visibleWidth3(head.stats);
  const clampedLeft = clampLine(left, Math.max(0, width - statsWidth - 1));
  const gap = Math.max(1, width - lineWidth(clampedLeft) - statsWidth);
  lines.push([...clampedLeft, { text: " ".repeat(gap) }, { text: head.stats, color: "dim" }]);
  if (head.subtext)
    lines.push(clampLine([{ text: `  ${head.subtext}`, color: "dim" }], width));
  const labelColumn = Math.min(LABEL_COLUMN_MAX, Math.max(0, ...groups.flatMap((group) => group.agents.map((a) => visibleWidth3(a.label)))));
  groups.forEach((group, groupIndex) => {
    const lastGroup = groupIndex === groups.length - 1;
    lines.push(clampLine([
      { text: "  " },
      {
        text: `${lastGroup ? glyphs.groupBottom : groupIndex === 0 ? glyphs.groupTop : glyphs.groupMid} `,
        color: "dim"
      },
      { text: group.title }
    ], width));
    const rail = lastGroup ? "  " : `${glyphs.vertical} `;
    group.agents.forEach((entry, agentIndex) => {
      const lastAgent = agentIndex === group.agents.length - 1;
      const segments = [
        { text: "  " },
        { text: rail, color: "dim" },
        { text: `${lastAgent ? glyphs.lastBranch : glyphs.branch} `, color: "dim" },
        rowGlyph(entry, glyphs),
        { text: " " }
      ];
      const statParts = entry.cached ? [REPLAYED_ANNOTATION, ...agentStatSegments(entry)] : agentStatSegments(entry);
      const pad = Math.max(0, labelColumn - visibleWidth3(entry.label));
      segments.push({ text: statParts.length > 0 ? entry.label + " ".repeat(pad) : entry.label });
      for (const part of statParts) {
        segments.push({ text: " · ", color: "dim" }, { text: part, color: "dim" });
      }
      lines.push(clampLine(segments, width));
    });
  });
  for (const message of logs) {
    const [first, ...rest3] = message.split(`
`);
    lines.push(clampLine([{ text: `  ${glyphs.log}  ${first}`, color: "dim" }], width));
    for (const continuation of rest3) {
      lines.push(clampLine([{ text: `     ${continuation}`, color: "dim" }], width));
    }
  }
  const totalTokens = input.totalTokens ?? agents2.reduce((sum, entry) => sum + (entry.tokens ?? 0), 0);
  const warning = sizeWarning({
    scheduledAgents: Math.max(input.agentCount ?? 0, totals.total),
    startedAgents: totals.started,
    totalTokens,
    agentCap: input.agentCap,
    tokenCap: input.tokenCap
  });
  if (warning) {
    lines.push(clampLine([{ text: `  ${glyphs.warning} Large workflow · /agents → Workflows to stop`, color: "warning" }], width));
  }
  return lines;
}
function styleWorkflowCardLines(lines, theme) {
  return lines.map((line) => line.map((segment) => {
    const text = segment.bold ? theme.bold(segment.text) : segment.text;
    return segment.color ? theme.fg(segment.color, text) : text;
  }).join(""));
}
function renderWorkflowCard(input, theme) {
  return new Text(styleWorkflowCardLines(layoutWorkflowCard(input), theme).join(`
`), 0, 0);
}
function renderWorkflowEntryCard(data, theme) {
  if (!data)
    return;
  return renderWorkflowCard({
    progress: data.progress,
    task: {
      status: data.status,
      workflowName: data.name,
      startTime: data.startTime,
      endTime: data.endTime
    },
    meta: data.meta,
    agentCount: data.agentCount,
    totalTokens: data.totalTokens,
    showToolTitle: true
  }, theme);
}

// src/workflow/task.ts
import { randomUUID as randomUUID3 } from "node:crypto";

// src/xml.ts
function escapeXml(s2) {
  return s2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// src/workflow/task.ts
function workflowRunId() {
  return `wf_${randomUUID3().replace(/-/g, "").slice(0, 12)}`;
}
function createWorkflowTask(init) {
  return {
    type: "local_workflow",
    id: init.id,
    status: "running",
    script: init.script,
    scriptPath: init.scriptPath,
    args: init.args,
    meta: init.meta,
    workflowName: init.meta?.name,
    toolCallId: init.toolCallId,
    journalPath: init.journalPath,
    replay: init.replay,
    resumedFrom: init.resumedFrom,
    replayedCount: 0,
    workflowProgress: [],
    progressVersion: 0,
    agentCount: 0,
    doneCount: 0,
    totalTokens: 0,
    totalToolCalls: 0,
    logs: [],
    abortController: new AbortController,
    startTime: init.startTime ?? Date.now(),
    totalPausedMs: 0
  };
}
function updateWorkflowProgressBatch(task, entries) {
  if (entries.length === 0)
    return;
  task.workflowProgress.push(...entries);
  task.progressVersion++;
  const { agents: agents2, logs } = collapse(task.workflowProgress);
  task.logs = logs;
  task.agentCount = Math.max(task.agentCount, agents2.length);
  let totalTokens = 0;
  let totalToolCalls = 0;
  let done = 0;
  for (const agent of agents2) {
    totalTokens += agent.tokens ?? 0;
    totalToolCalls += agent.toolCalls ?? 0;
    if (agent.state === "done")
      done++;
  }
  task.totalTokens = totalTokens;
  task.totalToolCalls = totalToolCalls;
  task.doneCount = done;
}
function pauseWorkflowTask(task, now = Date.now()) {
  if (task.status !== "running" || task.control === undefined)
    return false;
  task.control.pause();
  task.status = "paused";
  task.pausedAt = now;
  return true;
}
function resumeWorkflowTask(task, now = Date.now()) {
  if (task.status !== "paused" || task.control === undefined)
    return false;
  task.control.resume();
  task.status = "running";
  task.totalPausedMs = (task.totalPausedMs ?? 0) + Math.max(0, now - (task.pausedAt ?? now));
  task.pausedAt = undefined;
  return true;
}
function completeWorkflowTask(task, result) {
  if (task.pausedAt !== undefined) {
    task.totalPausedMs = (task.totalPausedMs ?? 0) + Math.max(0, Date.now() - task.pausedAt);
    task.pausedAt = undefined;
  }
  task.control = undefined;
  task.status = result.status;
  task.meta ??= result.meta;
  task.workflowName ??= result.meta.name;
  task.agentCount = Math.max(task.agentCount, result.agentCount);
  task.replayedCount = result.replayedCount;
  task.value = result.value;
  task.error = result.error;
  task.endTime = Date.now();
}
function failWorkflowTask(task, error3) {
  task.control = undefined;
  task.pausedAt = undefined;
  task.status = "failed";
  task.error = error3;
  task.endTime = Date.now();
}
function workflowResultText(task) {
  if (task.error !== undefined)
    return task.error;
  if (task.value === undefined)
    return "No output.";
  if (typeof task.value === "string")
    return task.value;
  return JSON.stringify(task.value, null, 2);
}
function resolveResumeTarget(runId, tasks) {
  const id = runId?.trim();
  if (id === undefined || id === "")
    return;
  const prior = tasks.get(id);
  if (prior === undefined) {
    const known = [...tasks.keys()];
    return {
      ok: false,
      message: `No workflow run "${id}" in this session. ` + (known.length > 0 ? `Runs this session: ${known.join(", ")}.` : "Nothing has run yet — call this without `resumeFromRunId`.")
    };
  }
  if (prior.status === "running") {
    return {
      ok: false,
      message: `Workflow "${id}" is still running. Stop it from /agents → Workflows before resuming it.`
    };
  }
  if (prior.journalPath === undefined) {
    return { ok: false, message: `Workflow "${id}" has no journal to resume from.` };
  }
  return {
    ok: true,
    runId: id,
    journalPath: prior.journalPath,
    scriptPath: prior.scriptPath ?? ""
  };
}
function formatWorkflowNotification(task, now = Date.now()) {
  const totals = stats(task.workflowProgress, task.agentCount);
  const status = task.status === "completed" ? "Done" : task.status === "killed" ? "Stopped" : `Error: ${task.error ?? "unknown"}`;
  const result = workflowResultText(task);
  return [
    `<task-notification>`,
    `<task-id>${task.id}</task-id>`,
    task.toolCallId ? `<tool-use-id>${escapeXml(task.toolCallId)}</tool-use-id>` : null,
    task.scriptPath ? `<script>${escapeXml(task.scriptPath)}</script>` : null,
    `<status>${escapeXml(status)}</status>`,
    `<summary>Workflow "${escapeXml(task.workflowName ?? task.id)}" ${task.status} — ${totals.done}/${totals.total} agents${task.replayedCount > 0 ? `, ${task.replayedCount} replayed from ${escapeXml(task.resumedFrom ?? "an earlier run")}` : ""}</summary>`,
    `<result>${escapeXml(result.length > 4000 ? `${result.slice(0, 4000)}
...(truncated)` : result)}</result>`,
    `<usage><total_tokens>${task.totalTokens}</total_tokens><tool_uses>${task.totalToolCalls}</tool_uses><duration_ms>${elapsedMs(task, now)}</duration_ms></usage>`,
    `</task-notification>`
  ].filter(Boolean).join(`
`);
}

// src/ui/workflow-dialog.ts
import {
  matchesKey as matchesKey4,
  stripTerminalSequences as stripTerminalSequences2,
  truncateToWidth as truncateToWidth5,
  visibleWidth as visibleWidth4,
  wrapTextWithAnsi as wrapTextWithAnsi2
} from "@earendil-works/pi-tui";
init_agent_widget();
var DEFAULT_WIDTH2 = 80;
var LEFT_PANE_WIDTH = 18;
var DEFAULT_PANE_BODY_ROWS = 22;
var MIN_PANE_BODY_ROWS = 6;
var PROMPT_COLLAPSED_LINES = 4;
var WORKFLOW_DIALOG_SPINNER_MS = 80;
var UNICODE_DIALOG_GLYPHS = {
  tick: UNICODE_GLYPHS.tick,
  cross: UNICODE_GLYPHS.cross,
  queued: "◌",
  pointer: "❯",
  focus: UNICODE_GLYPHS.pointer,
  spinner: SPINNER,
  box: {
    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",
    horizontal: "─",
    vertical: "│",
    topTee: "┬",
    bottomTee: "┴"
  },
  ellipsis: "…",
  upDown: "↑↓",
  enter: "⏎"
};
var ASCII_DIALOG_GLYPHS = {
  tick: ASCII_GLYPHS.tick,
  cross: ASCII_GLYPHS.cross,
  queued: "o",
  pointer: ">",
  focus: ASCII_GLYPHS.pointer,
  spinner: ["-", "\\", "|", "/"],
  box: {
    topLeft: "+",
    topRight: "+",
    bottomLeft: "+",
    bottomRight: "+",
    horizontal: "-",
    vertical: "|",
    topTee: "+",
    bottomTee: "+"
  },
  ellipsis: "~",
  upDown: "up/down",
  enter: "enter"
};
function dialogRowGlyph(state, glyphs, spinnerFrame = 0) {
  switch (state) {
    case "done":
      return { text: glyphs.tick, color: "success" };
    case "failed":
      return { text: glyphs.cross, color: "error" };
    case "skipped":
      return { text: glyphs.cross, color: "dim" };
    case "blocked":
      return { text: glyphs.cross, color: "warning" };
    case "queued":
    case "interrupted":
      return { text: glyphs.queued, color: "dim" };
    case "running":
      return { text: glyphs.spinner[spinnerFrame % glyphs.spinner.length], color: "dim" };
  }
}
var WORKFLOW_DIALOG_COPY = {
  waitingForSlot: "Waiting for an agent slot.",
  availableOnceStarted: "Available once the agent starts.",
  notAvailableYet: "Not available yet (agent still running).",
  noTranscript: "Transcript not available.",
  stoppedEarly: "The workflow stopped before this agent finished.",
  skippedByUser: "Skipped by user.",
  noToolCallsYet: "No tool calls yet.",
  noToolCalls: "No tool calls.",
  noAgents: "No agents"
};
var WORKFLOW_DIALOG_FILTERS = [
  "all",
  "running",
  "queued",
  "done",
  "failed",
  "blocked",
  "skipped",
  "interrupted"
];
function initialWorkflowDialogState(initialPhaseIndex = 0) {
  return {
    selectedPhase: initialPhaseIndex,
    selectedAgent: 0,
    level: "phases",
    filter: "all",
    promptExpanded: false
  };
}
function workflowDialogContentWidth(terminalWidth) {
  return Math.max(12, terminalWidth - 6);
}
var clampIndex = (index, length) => length === 0 ? 0 : Math.min(Math.max(0, Math.trunc(index)), length - 1);
function resolveWorkflowDialog(input) {
  const groups = buildPhaseGroups(input.progress, input.meta?.phases);
  const workflowActive = input.task.status === "running" || input.task.status === "paused";
  const clampedPhase = clampIndex(input.state.selectedPhase, groups.length);
  const all = groups[clampedPhase]?.agents ?? [];
  const visibleAgents = input.state.filter === "all" ? [...all] : all.filter((entry) => displayState(entry, workflowActive) === input.state.filter);
  const clampedAgent = clampIndex(input.state.selectedAgent, visibleAgents.length);
  return {
    groups,
    clampedPhase,
    clampedAgent,
    visibleAgents,
    selectedEntry: visibleAgents[clampedAgent],
    workflowActive,
    paused: input.task.status === "paused"
  };
}
function subStatusAnnotations(entry, state, now) {
  const parts = [];
  if (entry.isolation)
    parts.push(entry.isolation);
  if (entry.cached)
    parts.push(REPLAYED_ANNOTATION);
  if (entry.lastAttemptReason) {
    parts.push(entry.lastAttemptReason === "user-retry" ? "user retry" : entry.lastAttemptReason);
  }
  if (entry.attempt != null && entry.attempt > 1)
    parts.push(`attempt ${entry.attempt}`);
  if (state === "queued" && entry.queuedAt != null) {
    parts.push(`waiting ${formatDuration2(Math.max(0, now - entry.queuedAt))}`);
  }
  return parts;
}
var lineWidth2 = (line) => line.reduce((sum, s2) => sum + visibleWidth4(s2.text), 0);
function rightAlign2(left, right, width) {
  const rightWidth = lineWidth2(right);
  const clampedLeft = clampLine(left, Math.max(0, width - rightWidth - 1));
  const gap = Math.max(1, width - lineWidth2(clampedLeft) - rightWidth);
  return clampLine([...clampedLeft, { text: " ".repeat(gap) }, ...right], width);
}
function windowRange(selected, total, max) {
  const visible = Math.min(max, total);
  const start = selected < visible ? 0 : selected - visible + 1;
  return { start, end: start + visible };
}
function leftPaneWidth(width) {
  const available = Math.max(2, width - 3);
  return Math.max(1, Math.min(LEFT_PANE_WIDTH, Math.floor(available / 3), available - 1));
}
function padTitle(line, width, horizontal) {
  const gap = Math.max(0, width - lineWidth2(line));
  return gap > 0 ? [...line, { text: horizontal.repeat(gap), color: "dim" }] : line;
}
function padCell(line, width) {
  const clamped = clampLine(line, width);
  const gap = Math.max(0, width - lineWidth2(clamped));
  return gap > 0 ? [...clamped, { text: " ".repeat(gap) }] : clamped;
}
function frameTitle(title, width, glyphs) {
  const room = Math.max(0, width - 2);
  const shown = stripTerminalSequences2(truncateToWidth5(title, room, glyphs.ellipsis));
  const rule = Math.max(0, width - visibleWidth4(shown) - 2);
  return clampLine([
    { text: " ", color: "dim" },
    { text: shown, color: "muted", bold: true },
    { text: ` ${glyphs.box.horizontal.repeat(rule)}`, color: "dim" }
  ], width);
}
function paneFrame(options) {
  const { glyphs, width } = options;
  const box = glyphs.box;
  const left = leftPaneWidth(width);
  const right = Math.max(1, width - left - 3);
  const lines = [];
  lines.push([
    { text: box.topLeft, color: "dim" },
    ...padTitle(frameTitle(options.leftTitle, left, glyphs), left, box.horizontal),
    { text: box.topTee, color: "dim" },
    ...padTitle(frameTitle(options.rightTitle, right, glyphs), right, box.horizontal),
    { text: box.topRight, color: "dim" }
  ]);
  for (let row = 0;row < options.bodyRows; row++) {
    lines.push([
      { text: box.vertical, color: "dim" },
      ...padCell(options.leftRows[row] ?? [], left),
      { text: box.vertical, color: "dim" },
      ...padCell(options.rightRows[row] ?? [], right),
      { text: box.vertical, color: "dim" }
    ]);
  }
  lines.push([
    { text: box.bottomLeft, color: "dim" },
    { text: box.horizontal.repeat(left), color: "dim" },
    { text: box.bottomTee, color: "dim" },
    { text: box.horizontal.repeat(right), color: "dim" },
    { text: box.bottomRight, color: "dim" }
  ]);
  return lines;
}
var previewLines = (preview) => preview ? preview.split(`
`) : [];
function activityBody(entry, state) {
  if (state === "queued")
    return WORKFLOW_DIALOG_COPY.availableOnceStarted;
  if ((entry.toolCalls ?? 0) > 0)
    return WORKFLOW_DIALOG_COPY.noTranscript;
  return isLive(entry) ? WORKFLOW_DIALOG_COPY.noToolCallsYet : WORKFLOW_DIALOG_COPY.noToolCalls;
}
function outcomeBody(entry, state) {
  switch (state) {
    case "skipped":
      return WORKFLOW_DIALOG_COPY.skippedByUser;
    case "interrupted":
      return WORKFLOW_DIALOG_COPY.stoppedEarly;
    case "queued":
      return WORKFLOW_DIALOG_COPY.waitingForSlot;
    case "running":
      return WORKFLOW_DIALOG_COPY.notAvailableYet;
    case "failed":
    case "blocked":
      return entry.error ?? WORKFLOW_DIALOG_COPY.noTranscript;
    case "done":
      return entry.resultPreview ?? WORKFLOW_DIALOG_COPY.noTranscript;
  }
}
function agentActions(entry, workflowActive) {
  if (entry === undefined || !workflowActive)
    return { skip: false, retry: false };
  const state = displayState(entry, workflowActive);
  return { skip: state === "queued" || state === "running", retry: state === "running" };
}
function statusWord(state) {
  switch (state) {
    case "done":
      return "Completed";
    case "failed":
      return "Failed";
    case "skipped":
      return "Skipped";
    case "blocked":
      return "Blocked";
    case "queued":
      return "Queued";
    case "interrupted":
      return "Stopped";
    case "running":
      return "Running";
  }
}
function detailHeading(title, suffixes, width) {
  const line = [{ text: " " }, { text: title, color: "muted", bold: true }];
  for (const suffix of suffixes) {
    line.push({ text: " · ", color: "dim" }, { text: suffix, color: "dim" });
  }
  return clampLine(line, width);
}
var detailBody = (text, width) => clampLine([{ text: `   ${text}`, color: "dim" }], width);
function agentRow(options) {
  const { entry, selected, glyphs, width } = options;
  const display = displayState(entry, options.workflowActive);
  const head = [
    { text: " " },
    { text: selected ? glyphs.pointer : " ", color: "accent" },
    { text: " " },
    dialogRowGlyph(display, glyphs, options.spinnerFrame),
    { text: " " },
    { text: entry.label, color: selected ? "accent" : undefined }
  ];
  if (options.compact)
    return clampLine(head, width);
  const model = formatModel(entry);
  if (model)
    head.push({ text: ` ${model}`, color: "dim" });
  for (const part of [...subStatusAnnotations(entry, display, options.now), ...rowStatSegments(entry)]) {
    head.push({ text: " · ", color: "dim" }, { text: part, color: "dim" });
  }
  const duration = entry.durationMs ? [{ text: `${formatDuration2(entry.durationMs)} `, color: "dim" }] : [];
  return duration.length > 0 ? rightAlign2(head, duration, width) : clampLine(head, width);
}
function rowStatSegments(entry) {
  return entry.tokens ? [`${formatCompactTokens(entry.tokens)} tok`] : [];
}
function layoutWorkflowDialog(input) {
  const glyphs = input.ascii ? ASCII_DIALOG_GLYPHS : UNICODE_DIALOG_GLYPHS;
  const width = workflowDialogContentWidth(input.width ?? DEFAULT_WIDTH2);
  const now = input.now ?? Date.now();
  const view = resolveWorkflowDialog(input);
  const { state } = input;
  const capacity = Math.max(MIN_PANE_BODY_ROWS, input.bodyRows ?? DEFAULT_PANE_BODY_ROWS);
  const spinnerFrame = input.spinnerFrame ?? 0;
  const lines = [];
  const head = header(input.task, input.meta, view.groups, input.agentCount ?? 0, now);
  lines.push(clampLine([{ text: " " }, { text: head.name, color: "toolTitle", bold: true }], width));
  lines.push(rightAlign2(head.subtext ? [{ text: " " }, { text: head.subtext, color: "dim" }] : [], [{ text: head.stats, color: "dim" }], width));
  lines.push([]);
  const frameWidth = width - 1;
  const leftWidth = leftPaneWidth(frameWidth);
  const rightWidth = Math.max(1, frameWidth - leftWidth - 3);
  const inPhases = state.level === "phases";
  const entry = view.selectedEntry;
  const phaseRows = [];
  const digits = String(view.groups.length).length;
  const phases = windowRange(view.clampedPhase, view.groups.length, capacity);
  for (let i = phases.start;i < Math.min(phases.end, view.groups.length); i++) {
    const group = view.groups[i];
    const selected = i === view.clampedPhase;
    const color = selected ? "accent" : group.status === "done" ? "success" : group.status === "failed" ? "error" : "dim";
    const glyph = group.status === "done" ? glyphs.tick : group.status === "failed" ? glyphs.cross : String(i + 1);
    phaseRows.push(rightAlign2([
      { text: " " },
      { text: selected ? glyphs.pointer : " ", color: "accent" },
      { text: " " },
      { text: glyph.padStart(digits), color },
      { text: " " },
      { text: group.title, color }
    ], group.totalCount === 0 ? [] : [{ text: `${group.doneCount}/${group.totalCount} `, color }], leftWidth));
  }
  const agentPaneWidth = inPhases ? rightWidth : leftWidth;
  const agentRows = [];
  if (view.visibleAgents.length === 0) {
    agentRows.push(clampLine([{ text: `   ${WORKFLOW_DIALOG_COPY.noAgents}`, color: "dim" }], agentPaneWidth));
  } else {
    const agents2 = windowRange(view.clampedAgent, view.visibleAgents.length, capacity);
    for (let i = agents2.start;i < Math.min(agents2.end, view.visibleAgents.length); i++) {
      agentRows.push(agentRow({
        entry: view.visibleAgents[i],
        selected: i === view.clampedAgent,
        compact: !inPhases,
        width: agentPaneWidth,
        glyphs,
        workflowActive: view.workflowActive,
        spinnerFrame,
        now
      }));
    }
  }
  const detailRows = [];
  if (!inPhases && entry) {
    const display = displayState(entry, view.workflowActive);
    const model = formatModel(entry, { canonical: true });
    detailRows.push(clampLine([
      { text: " " },
      dialogRowGlyph(display, glyphs, spinnerFrame),
      { text: ` ${statusWord(display)}`, color: "muted" },
      ...model ? [{ text: " · ", color: "dim" }, { text: model, color: "dim" }] : []
    ], rightWidth));
    const stats2 = [];
    const thinking = formatThinking(entry);
    if (thinking)
      stats2.push(thinking);
    if (entry.tokens)
      stats2.push(`${formatCompactTokens(entry.tokens)} tok`);
    if (entry.toolCalls)
      stats2.push(`${entry.toolCalls} tool call${entry.toolCalls === 1 ? "" : "s"}`);
    if (entry.durationMs)
      stats2.push(formatDuration2(entry.durationMs));
    if (stats2.length > 0) {
      detailRows.push(clampLine([{ text: ` ${stats2.join(" · ")}`, color: "dim" }], rightWidth));
    }
    const prompt = previewLines(entry.promptPreview);
    const collapsed = !state.promptExpanded && prompt.length > PROMPT_COLLAPSED_LINES;
    const promptSuffix = [];
    if (prompt.length > 0)
      promptSuffix.push(`${prompt.length} ${prompt.length === 1 ? "line" : "lines"}`);
    if (prompt.length > PROMPT_COLLAPSED_LINES) {
      promptSuffix.push(`${glyphs.enter} ${state.promptExpanded ? "collapse" : "expand"}`);
    }
    detailRows.push([]);
    detailRows.push(detailHeading("Prompt", promptSuffix, rightWidth));
    if (prompt.length === 0) {
      detailRows.push(detailBody(WORKFLOW_DIALOG_COPY.availableOnceStarted, rightWidth));
    } else {
      const shown2 = collapsed ? prompt.slice(0, PROMPT_COLLAPSED_LINES) : prompt;
      for (const text of shown2)
        detailRows.push(detailBody(text, rightWidth));
      if (collapsed) {
        const hidden = prompt.length - PROMPT_COLLAPSED_LINES;
        detailRows.push(detailBody(`${glyphs.ellipsis} ${hidden} more line${hidden === 1 ? "" : "s"}`, rightWidth));
      }
    }
    const toolCalls = entry.toolCalls ?? 0;
    detailRows.push([]);
    detailRows.push(detailHeading("Activity", toolCalls > 0 ? [`${toolCalls} tool call${toolCalls === 1 ? "" : "s"}`] : [], rightWidth));
    detailRows.push(detailBody(activityBody(entry, display), rightWidth));
    detailRows.push([]);
    detailRows.push(detailHeading("Outcome", [], rightWidth));
    for (const text of wrapTextWithAnsi2(outcomeBody(entry, display), Math.max(1, rightWidth - 4))) {
      detailRows.push(detailBody(text, rightWidth));
    }
  }
  const phaseTitle = view.groups[view.clampedPhase]?.title ?? "Phases";
  const shown = view.visibleAgents.length;
  const agentPaneTitle = state.filter === "all" ? `${phaseTitle} · ${shown} agent${shown === 1 ? "" : "s"}` : `${phaseTitle} · ${shown} ${state.filter}`;
  const leftRows = inPhases ? phaseRows : agentRows;
  const rightRows = inPhases ? agentRows : detailRows;
  lines.push(...paneFrame({
    leftTitle: inPhases ? "Phases" : agentPaneTitle,
    rightTitle: inPhases ? agentPaneTitle : entry?.label ?? WORKFLOW_DIALOG_COPY.noAgents,
    leftRows,
    rightRows,
    width: width - 1,
    bodyRows: Math.min(capacity, Math.max(MIN_PANE_BODY_ROWS, leftRows.length, rightRows.length)),
    glyphs
  }).map((line) => [{ text: " " }, ...line]));
  const can = (action) => input.available?.[action] ?? true;
  const hints = [];
  if (inPhases) {
    hints.push(`${glyphs.upDown} select`);
    if (view.visibleAgents.length > 0)
      hints.push(`${glyphs.enter} open`);
    hints.push("f filter");
  } else {
    hints.push(`${glyphs.upDown} agent`);
    if (previewLines(entry?.promptPreview).length > PROMPT_COLLAPSED_LINES) {
      hints.push(`${glyphs.enter} prompt`);
    }
    const actions = agentActions(entry, view.workflowActive);
    if (actions.skip && can("onSkipAgent"))
      hints.push("s skip");
    if (actions.retry && can("onRetryAgent"))
      hints.push("r retry");
  }
  if (view.paused && can("onResume"))
    hints.push("p resume");
  else if (view.workflowActive && can("onPause"))
    hints.push("p pause");
  if (view.workflowActive && can("onKill"))
    hints.push("x stop");
  hints.push(inPhases ? "esc close" : "esc back");
  if (view.selectedEntry?.recordId !== undefined && can("onOpenAgent")) {
    hints.push("c convo");
  }
  lines.push(clampLine([{ text: ` ${hints.join(" · ")}`, color: "dim" }], width));
  return lines;
}
var nextFilter = (filter) => WORKFLOW_DIALOG_FILTERS[(WORKFLOW_DIALOG_FILTERS.indexOf(filter) + 1) % WORKFLOW_DIALOG_FILTERS.length];
function handleWorkflowDialogKey(data, state, view) {
  if (matchesKey4(data, "ctrl+c"))
    return { state, action: { kind: "cancel" } };
  if (matchesKey4(data, "escape") || matchesKey4(data, "q")) {
    if (state.level === "agent")
      return { state: { ...state, level: "phases", promptExpanded: false } };
    return { state, action: { kind: "cancel" } };
  }
  if (matchesKey4(data, "left") && state.level === "agent") {
    return { state: { ...state, level: "phases", promptExpanded: false } };
  }
  const down = matchesKey4(data, "j") || matchesKey4(data, "down");
  const up = matchesKey4(data, "k") || matchesKey4(data, "up");
  if (down || up) {
    const delta = down ? 1 : -1;
    if (state.level === "phases") {
      const next = clampIndex(view.clampedPhase + delta, view.groups.length);
      return { state: next === view.clampedPhase ? state : { ...state, selectedPhase: next, selectedAgent: 0 } };
    }
    return { state: { ...state, selectedAgent: clampIndex(view.clampedAgent + delta, view.visibleAgents.length) } };
  }
  if (matchesKey4(data, "enter") || matchesKey4(data, "right")) {
    if (state.level === "phases") {
      if (view.visibleAgents.length === 0)
        return { state };
      return { state: { ...state, level: "agent", promptExpanded: false } };
    }
    return { state: { ...state, promptExpanded: !state.promptExpanded } };
  }
  if (matchesKey4(data, "e")) {
    return { state: { ...state, promptExpanded: !state.promptExpanded } };
  }
  if (matchesKey4(data, "c")) {
    const recordId = view.selectedEntry?.recordId;
    return recordId === undefined ? undefined : { state, action: { kind: "open", recordId } };
  }
  if (matchesKey4(data, "f") && state.level === "phases") {
    return { state: { ...state, filter: nextFilter(state.filter), selectedAgent: 0 } };
  }
  if (matchesKey4(data, "x"))
    return view.workflowActive ? { state, action: { kind: "kill" } } : undefined;
  if (matchesKey4(data, "p")) {
    if (!view.workflowActive)
      return;
    return { state, action: { kind: view.paused ? "resume" : "pause" } };
  }
  const actions = agentActions(view.selectedEntry, view.workflowActive);
  if (matchesKey4(data, "s") && actions.skip && view.selectedEntry) {
    return { state, action: { kind: "skip", index: view.selectedEntry.index } };
  }
  if (matchesKey4(data, "r") && actions.retry && view.selectedEntry) {
    return { state, action: { kind: "retry", index: view.selectedEntry.index } };
  }
  return;
}
class WorkflowDialog {
  tui;
  source;
  theme;
  done;
  actions;
  state;
  spinnerFrame = 0;
  timer;
  closed = false;
  constructor(tui, source, theme, done, actions = {}, initialPhaseIndex = 0) {
    this.tui = tui;
    this.source = source;
    this.theme = theme;
    this.done = done;
    this.actions = actions;
    this.state = initialWorkflowDialogState(initialPhaseIndex);
    this.timer = setInterval(() => {
      this.spinnerFrame++;
      if (!this.closed)
        this.tui.requestRender();
    }, WORKFLOW_DIALOG_SPINNER_MS);
    this.timer.unref?.();
  }
  handleInput(data) {
    const input = { ...this.source(), state: this.state };
    const result = handleWorkflowDialogKey(data, this.state, resolveWorkflowDialog(input));
    if (!result)
      return;
    this.state = result.state;
    if (result.action)
      this.dispatch(result.action);
    this.tui.requestRender();
  }
  render(width) {
    const lines = layoutWorkflowDialog({
      ...this.source(),
      state: this.state,
      available: {
        onKill: this.actions.onKill !== undefined,
        onPause: this.actions.onPause !== undefined,
        onResume: this.actions.onResume !== undefined,
        onSkipAgent: this.actions.onSkipAgent !== undefined,
        onRetryAgent: this.actions.onRetryAgent !== undefined,
        onOpenAgent: this.actions.onOpenAgent !== undefined
      },
      width,
      spinnerFrame: this.spinnerFrame
    });
    return styleWorkflowCardLines(lines, this.theme);
  }
  invalidate() {}
  dispose() {
    this.closed = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
  dispatch(action) {
    switch (action.kind) {
      case "cancel":
        this.closed = true;
        this.done(undefined);
        return;
      case "kill":
        this.actions.onKill?.();
        return;
      case "pause":
        this.actions.onPause?.();
        return;
      case "resume":
        this.actions.onResume?.();
        return;
      case "skip":
        this.actions.onSkipAgent?.(action.index);
        return;
      case "retry":
        this.actions.onRetryAgent?.(action.index);
        return;
      case "open":
        this.actions.onOpenAgent?.(action.recordId);
        return;
    }
  }
}

// src/ui/workflow-menu.ts
async function showWorkflowDialog(ctx, task, deps) {
  const { VIEWPORT_HEIGHT_PCT: VIEWPORT_HEIGHT_PCT2 } = await Promise.resolve().then(() => (init_conversation_viewer(), exports_conversation_viewer));
  let overlay;
  await ctx.ui.custom((tui, theme, _keybindings, done) => new WorkflowDialog(tui, () => ({
    progress: task.workflowProgress,
    task: {
      status: task.status,
      workflowName: task.workflowName,
      startTime: task.startTime,
      endTime: task.endTime,
      totalPausedMs: task.totalPausedMs
    },
    meta: task.meta,
    agentCount: task.agentCount
  }), theme, done, {
    onKill: () => {
      if (task.abortController.signal.aborted)
        return;
      task.abortController.abort();
      ctx.ui.notify(`Stopped workflow "${task.meta?.name ?? task.id}".`, "info");
    },
    onPause: () => {
      if (pauseWorkflowTask(task)) {
        ctx.ui.notify("Paused — running agents finish, no new ones start.", "info");
      }
    },
    onResume: () => {
      if (resumeWorkflowTask(task))
        ctx.ui.notify("Resumed.", "info");
    },
    onSkipAgent: (index) => {
      if (task.control?.skip(index) !== true) {
        ctx.ui.notify("Nothing to skip — that agent has already finished.", "info");
      }
    },
    onRetryAgent: (index) => {
      if (task.control?.retry(index) !== true) {
        ctx.ui.notify("Only a running agent can be retried.", "info");
      }
    },
    onOpenAgent: (recordId) => {
      const record3 = deps.getRecord(recordId);
      if (record3 === undefined) {
        ctx.ui.notify("No conversation left — agent records are dropped ten minutes after they finish.", "info");
        return;
      }
      overlay?.setHidden(true);
      deps.viewAgentConversation(ctx, record3).catch((err) => ctx.ui.notify(`Could not open the conversation: ${err instanceof Error ? err.message : String(err)}`, "warning")).finally(() => overlay?.setHidden(false));
    }
  }), {
    overlay: true,
    overlayOptions: { anchor: "center", width: "90%", maxHeight: `${VIEWPORT_HEIGHT_PCT2}%` },
    onHandle: (handle) => {
      overlay = handle;
    }
  });
}
function openWorkflowFromFleet(id, deps) {
  const task = deps.tasks.get(id);
  const ctx = deps.getCtx();
  if (task === undefined || ctx === undefined)
    return;
  return showWorkflowDialog(ctx, task, deps);
}
async function showWorkflowsMenu(ctx, deps) {
  const tasks = [...deps.tasks.values()].sort((a, b2) => b2.startTime - a.startTime);
  if (tasks.length === 0) {
    ctx.ui.notify("No workflows in this session.", "info");
    return;
  }
  if (tasks.length === 1) {
    await showWorkflowDialog(ctx, tasks[0], deps);
    return;
  }
  const labels = tasks.map((task) => `${task.meta?.name ?? task.id} — ${task.status}, ${task.agentCount} agent${task.agentCount === 1 ? "" : "s"} · ${task.id}`);
  const picked = await ctx.ui.select("Workflows", labels);
  const index = picked !== undefined ? labels.indexOf(picked) : -1;
  if (index >= 0)
    await showWorkflowDialog(ctx, tasks[index], deps);
}
// src/workflow/collisions.ts
init_agent_runner();
var FOREIGN_WORKFLOW_TOOL_NAMES = new Set([
  SUBAGENT_TOOL_NAMES.WORKFLOW,
  "Workflow"
]);
function decideWorkflowCollision(input) {
  const foreign = input.tools.find((tool) => FOREIGN_WORKFLOW_TOOL_NAMES.has(tool.name) && tool.description !== input.ownDescription);
  if (foreign === undefined)
    return { kind: "none" };
  const source = foreign.sourceInfo?.source ?? "unknown source";
  const tookOurName = foreign.name === SUBAGENT_TOOL_NAMES.WORKFLOW;
  if (input.pinned) {
    if (!tookOurName)
      return { kind: "none" };
    return {
      kind: "report",
      message: `Another extension (${source}) already registers a "${SUBAGENT_TOOL_NAMES.WORKFLOW}" tool. ` + "Pi keeps the first registration, so this extension's workflow tool is not offered to the " + "model. Disable one of the two."
    };
  }
  return {
    kind: "standDown",
    message: `Another extension (${source}) already provides a "${foreign.name}" tool, so this extension's ` + "workflows are disabled for this session to avoid offering the model two orchestrators. " + 'Set `"workflowsEnabled": true` in .pi/subagents.json to keep both.',
    withdraw: !tookOurName
  };
}

// src/workflow/entry.ts
var WORKFLOW_ENTRY_TYPE = "subagents:workflow";
function workflowEntryData(task) {
  return {
    name: task.workflowName ?? task.id,
    status: task.status,
    startTime: task.startTime,
    endTime: task.endTime,
    progress: task.workflowProgress,
    agentCount: task.agentCount,
    totalTokens: task.totalTokens,
    ...task.meta !== undefined ? { meta: task.meta } : {}
  };
}

// src/workflow/host.ts
init_agent_types();
init_model_scope();
import { existsSync as existsSync10 } from "node:fs";

// src/workflow/saved.ts
init_memory();
import { existsSync as existsSync9, readdirSync as readdirSync3, readFileSync as readFileSync8, statSync as statSync3 } from "node:fs";
import { isAbsolute as isAbsolute3, join as join11 } from "node:path";
import { getAgentDir as getAgentDir8 } from "@earendil-works/pi-coding-agent";

// src/workflow/meta.ts
import { createContext, Script } from "node:vm";

class WorkflowMetaError extends Error {
}
var META_EVAL_TIMEOUT_MS = 100;
var PURE_LITERAL_HINT = "The `meta` object must be a PURE LITERAL — no variables, function calls, spreads, or template interpolation.";
var META_DECLARATION = /(^|[\r\n])[ \t]*export[ \t\r\n]+const[ \t\r\n]+meta[ \t\r\n]*=/;
function hasMetaDeclaration(source) {
  return META_DECLARATION.test(source);
}
function scanObjectLiteral(source, open) {
  let depth = 0;
  let i = open;
  let sawInterpolation = false;
  let mode = "code";
  const templateStack = [];
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (mode === "line-comment") {
      if (c === `
`)
        mode = "code";
      i++;
      continue;
    }
    if (mode === "block-comment") {
      if (c === "*" && next === "/") {
        mode = "code";
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    if (mode === "single" || mode === "double" || mode === "regex") {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (mode === "single" && c === "'")
        mode = "code";
      else if (mode === "double" && c === '"')
        mode = "code";
      else if (mode === "regex" && c === "/")
        mode = "code";
      else if (c === `
` && mode !== "double")
        mode = "code";
      i++;
      continue;
    }
    if (mode === "template") {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === "`") {
        mode = "code";
        i++;
        continue;
      }
      if (c === "$" && next === "{") {
        sawInterpolation = true;
        templateStack.push(depth);
        depth++;
        mode = "code";
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    if (c === "/" && next === "/") {
      mode = "line-comment";
      i += 2;
      continue;
    }
    if (c === "/" && next === "*") {
      mode = "block-comment";
      i += 2;
      continue;
    }
    if (c === "'") {
      mode = "single";
      i++;
      continue;
    }
    if (c === '"') {
      mode = "double";
      i++;
      continue;
    }
    if (c === "`") {
      mode = "template";
      i++;
      continue;
    }
    if (c === "/" && isRegexPosition(source, i)) {
      mode = "regex";
      i++;
      continue;
    }
    if (c === "{") {
      depth++;
      i++;
      continue;
    }
    if (c === "}") {
      depth--;
      i++;
      if (templateStack.length > 0 && depth === templateStack[templateStack.length - 1]) {
        templateStack.pop();
        mode = "template";
        continue;
      }
      if (depth === 0)
        return { end: i, sawInterpolation };
      continue;
    }
    i++;
  }
  return { end: -1, sawInterpolation };
}
function isRegexPosition(source, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(source[j]))
    j--;
  if (j < 0)
    return true;
  const prev = source[j];
  return !/[\w$)\]]/.test(prev);
}
function fail(message) {
  throw new WorkflowMetaError(message);
}
function assertPhases(value2) {
  if (value2 === undefined)
    return;
  if (!Array.isArray(value2))
    fail("`meta.phases` must be an array of { title, detail?, model? } objects.");
  return value2.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      fail(`\`meta.phases[${index}]\` must be an object with a \`title\`.`);
    }
    const { title, detail, model } = entry;
    if (typeof title !== "string" || title.trim() === "") {
      fail(`\`meta.phases[${index}].title\` must be a non-empty string.`);
    }
    if (detail !== undefined && typeof detail !== "string") {
      fail(`\`meta.phases[${index}].detail\` must be a string.`);
    }
    if (model !== undefined && typeof model !== "string") {
      fail(`\`meta.phases[${index}].model\` must be a string.`);
    }
    return { title, ...detail !== undefined ? { detail } : {}, ...model !== undefined ? { model } : {} };
  });
}
function extractMeta(source) {
  const declaration = META_DECLARATION.exec(source);
  if (!declaration) {
    fail("A workflow script must begin with `export const meta = { name, description }`.\n" + PURE_LITERAL_HINT);
  }
  const open = source.indexOf("{", declaration.index + declaration[0].length);
  if (open === -1)
    fail("`export const meta` must be assigned an object literal.\n" + PURE_LITERAL_HINT);
  const { end: close, sawInterpolation } = scanObjectLiteral(source, open);
  if (close === -1)
    fail("`meta` object literal is never closed — check for an unbalanced `{`.");
  if (sawInterpolation) {
    fail("`meta` must not use template interpolation (`${...}`).\n" + PURE_LITERAL_HINT);
  }
  const fragment = source.slice(open, close);
  let value2;
  try {
    value2 = new Script(`(${fragment})`, { filename: "workflow-meta.js" }).runInContext(createContext({}), { timeout: META_EVAL_TIMEOUT_MS });
  } catch (error3) {
    const detail = error3 instanceof Error ? error3.message : String(error3);
    if (/timed out|Script execution/i.test(detail)) {
      fail(`\`meta\` did not finish evaluating within ${META_EVAL_TIMEOUT_MS}ms — it must be a literal, not a computation.
` + PURE_LITERAL_HINT);
    }
    fail(`\`meta\` could not be evaluated: ${detail}
${PURE_LITERAL_HINT}`);
  }
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    fail("`meta` must be an object literal.\n" + PURE_LITERAL_HINT);
  }
  const raw = value2;
  if (typeof raw.name !== "string" || raw.name.trim() === "") {
    fail("`meta.name` is required and must be a non-empty string.");
  }
  if (typeof raw.description !== "string" || raw.description.trim() === "") {
    fail("`meta.description` is required and must be a non-empty string.");
  }
  if (raw.whenToUse !== undefined && typeof raw.whenToUse !== "string") {
    fail("`meta.whenToUse` must be a string.");
  }
  const phases = assertPhases(raw.phases);
  const meta = {
    name: raw.name,
    description: raw.description,
    ...raw.whenToUse !== undefined ? { whenToUse: raw.whenToUse } : {},
    ...phases !== undefined ? { phases } : {}
  };
  const exportAt = source.indexOf("export", declaration.index);
  const body = `${source.slice(0, exportAt)}${" ".repeat(6)}${source.slice(exportAt + 6)}`;
  return { meta, body };
}
var workflowNames = new Map;
function workflowCallName(args) {
  const source = args.script;
  if (source === undefined || source === "") {
    if (args.scriptPath !== undefined)
      return args.scriptPath.split(/[/\\]/).pop() ?? "workflow";
    return args.name !== undefined && args.name !== "" ? args.name : "workflow";
  }
  const cached = workflowNames.get(source);
  if (cached !== undefined)
    return cached;
  let name = "workflow";
  try {
    name = extractMeta(source).meta.name;
  } catch {}
  workflowNames.set(source, name);
  return name;
}

// src/workflow/runtime.ts
import { cpus } from "node:os";
import { Worker } from "node:worker_threads";

// src/workflow/journal.ts
import { createHash } from "node:crypto";
import { appendFileSync as appendFileSync2, readFileSync as readFileSync7 } from "node:fs";
function journalKey(input) {
  const canonical = JSON.stringify([
    input.prompt,
    input.label ?? null,
    input.model ?? null,
    input.agentType ?? null,
    input.effort ?? null,
    input.isolation ?? null,
    input.gate ?? null,
    input.resume ?? null,
    ...input.schema !== undefined ? [input.schema] : []
  ]);
  return createHash("sha256").update(canonical).digest("hex").slice(0, 32);
}
function readJournal(path) {
  let raw;
  try {
    raw = readFileSync7(path, "utf-8");
  } catch {
    return [];
  }
  const entries = [];
  for (const line of raw.split(`
`)) {
    if (line.trim() === "")
      continue;
    try {
      const parsed = JSON.parse(line);
      if (!isEntry(parsed))
        continue;
      entries.push(parsed);
    } catch {}
  }
  entries.sort((a, b2) => a.index - b2.index);
  return entries;
}
function appendJournal(path, entry) {
  try {
    appendFileSync2(path, `${JSON.stringify(entry)}
`, "utf-8");
  } catch {}
}
function isEntry(value2) {
  if (typeof value2 !== "object" || value2 === null)
    return false;
  const entry = value2;
  return Number.isInteger(entry.index) && entry.index >= 0 && typeof entry.key === "string" && typeof entry.ok === "boolean" && (entry.text === undefined || typeof entry.text === "string") && (entry.resumed === undefined || entry.resumed === true);
}

// node_modules/typebox/build/system/arguments/arguments.mjs
var exports_arguments = {};
__export(exports_arguments, {
  Match: () => Match
});
function Match(args, match) {
  return match[args.length]?.(...args) ?? (() => {
    throw Error("Invalid Arguments");
  })();
}
// node_modules/typebox/build/guard/guard.mjs
var exports_guard = {};
__export(exports_guard, {
  Values: () => Values,
  Symbols: () => Symbols,
  ShiftLeft: () => ShiftLeft,
  Keys: () => Keys,
  IsValueLike: () => IsValueLike,
  IsUnsafePropertyKey: () => IsUnsafePropertyKey,
  IsUndefined: () => IsUndefined5,
  IsSymbol: () => IsSymbol4,
  IsString: () => IsString4,
  IsObjectNotArray: () => IsObjectNotArray,
  IsObject: () => IsObject5,
  IsNumber: () => IsNumber5,
  IsNull: () => IsNull4,
  IsMultipleOf: () => IsMultipleOf,
  IsMinLength: () => IsMinLength2,
  IsMaxLength: () => IsMaxLength2,
  IsLessThan: () => IsLessThan,
  IsLessEqualThan: () => IsLessEqualThan,
  IsInteger: () => IsInteger3,
  IsGreaterThan: () => IsGreaterThan,
  IsGreaterEqualThan: () => IsGreaterEqualThan,
  IsFunction: () => IsFunction4,
  IsEqual: () => IsEqual,
  IsDeepEqual: () => IsDeepEqual,
  IsConstructor: () => IsConstructor3,
  IsClassInstance: () => IsClassInstance,
  IsBoolean: () => IsBoolean4,
  IsBigInt: () => IsBigInt4,
  IsArray: () => IsArray5,
  HasPropertyKey: () => HasPropertyKey2,
  GraphemeCount: () => GraphemeCount2,
  EveryAll: () => EveryAll,
  Every: () => Every,
  EntriesRegExp: () => EntriesRegExp,
  Entries: () => Entries
});

// node_modules/typebox/build/guard/string.mjs
function IsBetween(value2, min, max) {
  return value2 >= min && value2 <= max;
}
function IsZeroWidthJoiner(value2) {
  return value2 === 8205;
}
function IsHighSurrogate(value2) {
  return IsBetween(value2, 55296, 56319);
}
function IsRegionalIndicator(value2) {
  return IsBetween(value2, 127462, 127487);
}
function IsVariationSelector(value2) {
  return IsBetween(value2, 65024, 65039);
}
function IsCombiningMark(value2) {
  return IsBetween(value2, 768, 879) || IsBetween(value2, 6832, 6911) || IsBetween(value2, 7616, 7679) || IsBetween(value2, 65056, 65071);
}
function CodePointLength(value2) {
  return value2 > 65535 ? 2 : 1;
}
function ConsumeModifiers(value2, index) {
  while (index < value2.length) {
    const point = value2.codePointAt(index);
    if (IsCombiningMark(point) || IsVariationSelector(point)) {
      index += CodePointLength(point);
    } else {
      break;
    }
  }
  return index;
}
function NextGraphemeClusterIndex(value2, clusterStart) {
  const startCP = value2.codePointAt(clusterStart);
  let clusterEnd = clusterStart + CodePointLength(startCP);
  clusterEnd = ConsumeModifiers(value2, clusterEnd);
  while (clusterEnd < value2.length - 1 && value2[clusterEnd] === "‍") {
    const nextCP = value2.codePointAt(clusterEnd + 1);
    clusterEnd += 1 + CodePointLength(nextCP);
    clusterEnd = ConsumeModifiers(value2, clusterEnd);
  }
  if (IsRegionalIndicator(startCP) && clusterEnd < value2.length && IsRegionalIndicator(value2.codePointAt(clusterEnd))) {
    clusterEnd += CodePointLength(value2.codePointAt(clusterEnd));
  }
  return clusterEnd;
}
function IsGraphemeCodePoint(value2) {
  return IsHighSurrogate(value2) || IsCombiningMark(value2) || IsVariationSelector(value2) || IsZeroWidthJoiner(value2);
}
function GraphemeCount(value2) {
  let count = 0;
  let index = 0;
  while (index < value2.length) {
    index = NextGraphemeClusterIndex(value2, index);
    count++;
  }
  return count;
}
function IsMinLength(value2, minLength) {
  if (minLength === 0)
    return true;
  let count = 0;
  let index = 0;
  while (index < value2.length) {
    index = NextGraphemeClusterIndex(value2, index);
    count++;
    if (count >= minLength)
      return true;
  }
  return false;
}
function IsMaxLength(value2, maxLength) {
  let count = 0;
  let index = 0;
  while (index < value2.length) {
    index = NextGraphemeClusterIndex(value2, index);
    count++;
    if (count > maxLength)
      return false;
  }
  return true;
}
function IsMinLengthFast(value2, minLength) {
  if (minLength === 0)
    return true;
  let index = 0;
  while (index < value2.length) {
    if (IsGraphemeCodePoint(value2.charCodeAt(index))) {
      return IsMinLength(value2, minLength);
    }
    index++;
    if (index >= minLength)
      return true;
  }
  return false;
}
function IsMaxLengthFast(value2, maxLength) {
  let index = 0;
  while (index < value2.length) {
    if (IsGraphemeCodePoint(value2.charCodeAt(index))) {
      return IsMaxLength(value2, maxLength);
    }
    index++;
    if (index > maxLength)
      return false;
  }
  return true;
}

// node_modules/typebox/build/guard/guard.mjs
function IsArray5(value2) {
  return Array.isArray(value2);
}
function IsBigInt4(value2) {
  return IsEqual(typeof value2, "bigint");
}
function IsBoolean4(value2) {
  return IsEqual(typeof value2, "boolean");
}
function IsConstructor3(value2) {
  if (IsUndefined5(value2) || !IsFunction4(value2))
    return false;
  const result = Function.prototype.toString.call(value2);
  if (/^class\s/.test(result))
    return true;
  if (/\[native code\]/.test(result))
    return true;
  return false;
}
function IsFunction4(value2) {
  return IsEqual(typeof value2, "function");
}
function IsInteger3(value2) {
  return Number.isInteger(value2);
}
function IsNull4(value2) {
  return IsEqual(value2, null);
}
function IsNumber5(value2) {
  return Number.isFinite(value2);
}
function IsObjectNotArray(value2) {
  return IsObject5(value2) && !IsArray5(value2);
}
function IsObject5(value2) {
  return IsEqual(typeof value2, "object") && !IsNull4(value2);
}
function IsString4(value2) {
  return IsEqual(typeof value2, "string");
}
function IsSymbol4(value2) {
  return IsEqual(typeof value2, "symbol");
}
function IsUndefined5(value2) {
  return IsEqual(value2, undefined);
}
function IsEqual(left, right) {
  return left === right;
}
function IsGreaterThan(left, right) {
  return left > right;
}
function IsLessThan(left, right) {
  return left < right;
}
function IsLessEqualThan(left, right) {
  return left <= right;
}
function IsGreaterEqualThan(left, right) {
  return left >= right;
}
function IsMultipleOf(dividend, divisor) {
  if (IsBigInt4(dividend) || IsBigInt4(divisor)) {
    return BigInt(dividend) % BigInt(divisor) === 0n;
  }
  const tolerance = 0.0000000001;
  if (!IsNumber5(dividend))
    return true;
  if (IsInteger3(dividend) && 1 / divisor % 1 === 0)
    return true;
  const mod = dividend % divisor;
  return Math.min(Math.abs(mod), Math.abs(mod - divisor), Math.abs(mod + divisor)) < tolerance;
}
function IsClassInstance(value2) {
  if (!IsObject5(value2))
    return false;
  const proto = globalThis.Object.getPrototypeOf(value2);
  if (IsNull4(proto))
    return false;
  return IsEqual(typeof proto.constructor, "function") && !(IsEqual(proto.constructor, globalThis.Object) || IsEqual(proto.constructor.name, "Object"));
}
function IsValueLike(value2) {
  return IsBigInt4(value2) || IsBoolean4(value2) || IsNull4(value2) || IsNumber5(value2) || IsString4(value2) || IsUndefined5(value2);
}
function GraphemeCount2(value2) {
  return GraphemeCount(value2);
}
function IsMaxLength2(value2, length) {
  return IsMaxLengthFast(value2, length);
}
function IsMinLength2(value2, length) {
  return IsMinLengthFast(value2, length);
}
function Every(value2, offset, callback) {
  for (let index = offset;index < value2.length; index++) {
    if (!callback(value2[index], index))
      return false;
  }
  return true;
}
function EveryAll(value2, offset, callback) {
  let result = true;
  for (let index = offset;index < value2.length; index++) {
    if (!callback(value2[index], index))
      result = false;
  }
  return result;
}
function ShiftLeft(array3, true_, false_) {
  return IsEqual(array3.length, 0) ? false_() : true_(array3[0], array3.slice(1));
}
function IsUnsafePropertyKey(key) {
  return IsEqual(key, "__proto__") || IsEqual(key, "constructor") || IsEqual(key, "prototype");
}
function HasPropertyKey2(value2, key) {
  return IsUnsafePropertyKey(key) ? Object.prototype.hasOwnProperty.call(value2, key) : (key in value2);
}
function EntriesRegExp(value2) {
  return Keys(value2).map((key) => [new RegExp(`^${key}$`), value2[key]]);
}
function Entries(value2) {
  return Object.entries(value2);
}
function Keys(value2) {
  return Object.getOwnPropertyNames(value2);
}
function Symbols(value2) {
  return Object.getOwnPropertySymbols(value2);
}
function Values(value2) {
  return Object.values(value2);
}
function DeepEqualObject(left, right) {
  if (!IsObject5(right))
    return false;
  const keys = Keys(left);
  return IsEqual(keys.length, Keys(right).length) && keys.every((key) => IsDeepEqual(left[key], right[key]));
}
function DeepEqualArray(left, right) {
  return IsArray5(right) && IsEqual(left.length, right.length) && left.every((_2, index) => IsDeepEqual(left[index], right[index]));
}
function IsDeepEqual(left, right) {
  return IsArray5(left) ? DeepEqualArray(left, right) : IsObject5(left) ? DeepEqualObject(left, right) : IsEqual(left, right);
}
// node_modules/typebox/build/guard/globals.mjs
var exports_globals = {};
__export(exports_globals, {
  IsUint8ClampedArray: () => IsUint8ClampedArray,
  IsUint8Array: () => IsUint8Array4,
  IsUint32Array: () => IsUint32Array,
  IsUint16Array: () => IsUint16Array,
  IsTypeArray: () => IsTypeArray,
  IsString: () => IsString5,
  IsSet: () => IsSet,
  IsRegExp: () => IsRegExp4,
  IsNumber: () => IsNumber6,
  IsMap: () => IsMap,
  IsInt8Array: () => IsInt8Array,
  IsInt32Array: () => IsInt32Array,
  IsInt16Array: () => IsInt16Array,
  IsFloat64Array: () => IsFloat64Array,
  IsFloat32Array: () => IsFloat32Array,
  IsDate: () => IsDate4,
  IsBoolean: () => IsBoolean5,
  IsBigUint64Array: () => IsBigUint64Array,
  IsBigInt64Array: () => IsBigInt64Array
});
function IsBoolean5(value2) {
  return value2 instanceof Boolean;
}
function IsNumber6(value2) {
  return value2 instanceof Number;
}
function IsString5(value2) {
  return value2 instanceof String;
}
function IsTypeArray(value2) {
  return globalThis.ArrayBuffer.isView(value2);
}
function IsInt8Array(value2) {
  return value2 instanceof globalThis.Int8Array;
}
function IsUint8Array4(value2) {
  return value2 instanceof globalThis.Uint8Array;
}
function IsUint8ClampedArray(value2) {
  return value2 instanceof globalThis.Uint8ClampedArray;
}
function IsInt16Array(value2) {
  return value2 instanceof globalThis.Int16Array;
}
function IsUint16Array(value2) {
  return value2 instanceof globalThis.Uint16Array;
}
function IsInt32Array(value2) {
  return value2 instanceof globalThis.Int32Array;
}
function IsUint32Array(value2) {
  return value2 instanceof globalThis.Uint32Array;
}
function IsFloat32Array(value2) {
  return value2 instanceof globalThis.Float32Array;
}
function IsFloat64Array(value2) {
  return value2 instanceof globalThis.Float64Array;
}
function IsBigInt64Array(value2) {
  return value2 instanceof globalThis.BigInt64Array;
}
function IsBigUint64Array(value2) {
  return value2 instanceof globalThis.BigUint64Array;
}
function IsRegExp4(value2) {
  return value2 instanceof globalThis.RegExp;
}
function IsDate4(value2) {
  return value2 instanceof globalThis.Date;
}
function IsSet(value2) {
  return value2 instanceof globalThis.Set;
}
function IsMap(value2) {
  return value2 instanceof globalThis.Map;
}
// node_modules/typebox/build/guard/index.mjs
var guard_default = exports_guard;

// node_modules/typebox/build/schema/types/_refine.mjs
function IsRefine(value2) {
  return exports_guard.HasPropertyKey(value2, "~refine") && exports_guard.IsArray(value2["~refine"]) && exports_guard.Every(value2["~refine"], 0, (value3) => exports_guard.IsObject(value3) && exports_guard.HasPropertyKey(value3, "check") && exports_guard.HasPropertyKey(value3, "error") && exports_guard.IsFunction(value3.check) && exports_guard.IsFunction(value3.error));
}
// node_modules/typebox/build/schema/types/schema.mjs
function IsSchemaObject(value2) {
  return exports_guard.IsObject(value2) && !exports_guard.IsArray(value2);
}
function IsSchemaBoolean(value2) {
  return exports_guard.IsBoolean(value2);
}
function IsSchema3(value2) {
  return IsSchemaObject(value2) || IsSchemaBoolean(value2);
}

// node_modules/typebox/build/schema/types/additionalItems.mjs
function IsAdditionalItems(schema3) {
  return exports_guard.HasPropertyKey(schema3, "additionalItems") && IsSchema3(schema3.additionalItems);
}
// node_modules/typebox/build/schema/types/additionalProperties.mjs
function IsAdditionalProperties2(schema3) {
  return exports_guard.HasPropertyKey(schema3, "additionalProperties") && IsSchema3(schema3.additionalProperties);
}
// node_modules/typebox/build/schema/types/allOf.mjs
function IsAllOf(schema3) {
  return exports_guard.HasPropertyKey(schema3, "allOf") && exports_guard.IsArray(schema3.allOf) && schema3.allOf.every((value2) => IsSchema3(value2));
}
// node_modules/typebox/build/schema/types/anchor.mjs
function IsAnchor(schema3) {
  return exports_guard.HasPropertyKey(schema3, "$anchor") && exports_guard.IsString(schema3.$anchor);
}
// node_modules/typebox/build/schema/types/anyOf.mjs
function IsAnyOf(schema3) {
  return exports_guard.HasPropertyKey(schema3, "anyOf") && exports_guard.IsArray(schema3.anyOf) && schema3.anyOf.every((value2) => IsSchema3(value2));
}
// node_modules/typebox/build/schema/types/const.mjs
function IsConst(value2) {
  return exports_guard.HasPropertyKey(value2, "const");
}
// node_modules/typebox/build/schema/types/contains.mjs
function IsContains(schema3) {
  return exports_guard.HasPropertyKey(schema3, "contains") && IsSchema3(schema3.contains);
}
// node_modules/typebox/build/schema/types/default.mjs
function IsDefault(schema3) {
  return exports_guard.HasPropertyKey(schema3, "default");
}
// node_modules/typebox/build/schema/types/dependencies.mjs
function IsDependencies(schema3) {
  return exports_guard.HasPropertyKey(schema3, "dependencies") && exports_guard.IsObject(schema3.dependencies) && Object.values(schema3.dependencies).every((value2) => IsSchema3(value2) || exports_guard.IsArray(value2) && value2.every((value3) => exports_guard.IsString(value3)));
}
// node_modules/typebox/build/schema/types/dependentRequired.mjs
function IsDependentRequired(schema3) {
  return exports_guard.HasPropertyKey(schema3, "dependentRequired") && exports_guard.IsObject(schema3.dependentRequired) && Object.values(schema3.dependentRequired).every((value2) => exports_guard.IsArray(value2) && value2.every((value3) => exports_guard.IsString(value3)));
}
// node_modules/typebox/build/schema/types/dependentSchemas.mjs
function IsDependentSchemas(schema3) {
  return exports_guard.HasPropertyKey(schema3, "dependentSchemas") && exports_guard.IsObject(schema3.dependentSchemas) && Object.values(schema3.dependentSchemas).every((value2) => IsSchema3(value2));
}
// node_modules/typebox/build/schema/types/dynamicAnchor.mjs
function IsDynamicAnchor(schema3) {
  return exports_guard.HasPropertyKey(schema3, "$dynamicAnchor") && exports_guard.IsString(schema3.$dynamicAnchor);
}
// node_modules/typebox/build/schema/types/dynamicRef.mjs
function IsDynamicRef(schema3) {
  return exports_guard.HasPropertyKey(schema3, "$dynamicRef") && exports_guard.IsString(schema3.$dynamicRef);
}
// node_modules/typebox/build/schema/types/else.mjs
function IsElse(schema3) {
  return exports_guard.HasPropertyKey(schema3, "else") && IsSchema3(schema3.else);
}
// node_modules/typebox/build/schema/types/enum.mjs
function IsEnum(schema3) {
  return exports_guard.HasPropertyKey(schema3, "enum") && exports_guard.IsArray(schema3.enum);
}
// node_modules/typebox/build/schema/types/exclusiveMaximum.mjs
function IsExclusiveMaximum(schema3) {
  return exports_guard.HasPropertyKey(schema3, "exclusiveMaximum") && (exports_guard.IsNumber(schema3.exclusiveMaximum) || exports_guard.IsBigInt(schema3.exclusiveMaximum));
}
// node_modules/typebox/build/schema/types/exclusiveMinimum.mjs
function IsExclusiveMinimum(schema3) {
  return exports_guard.HasPropertyKey(schema3, "exclusiveMinimum") && (exports_guard.IsNumber(schema3.exclusiveMinimum) || exports_guard.IsBigInt(schema3.exclusiveMinimum));
}
// node_modules/typebox/build/schema/types/format.mjs
function IsFormat(schema3) {
  return exports_guard.HasPropertyKey(schema3, "format") && exports_guard.IsString(schema3.format);
}
// node_modules/typebox/build/schema/types/id.mjs
function IsId(schema3) {
  return exports_guard.HasPropertyKey(schema3, "$id") && exports_guard.IsString(schema3.$id);
}
// node_modules/typebox/build/schema/types/if.mjs
function IsIf(schema3) {
  return exports_guard.HasPropertyKey(schema3, "if") && IsSchema3(schema3.if);
}
// node_modules/typebox/build/schema/types/items.mjs
function IsItems(schema3) {
  return exports_guard.HasPropertyKey(schema3, "items") && (IsSchema3(schema3.items) || exports_guard.IsArray(schema3.items) && schema3.items.every((value2) => {
    return IsSchema3(value2);
  }));
}
function IsItemsSized(schema3) {
  return IsItems(schema3) && exports_guard.IsArray(schema3.items);
}
// node_modules/typebox/build/schema/types/maximum.mjs
function IsMaximum(schema3) {
  return exports_guard.HasPropertyKey(schema3, "maximum") && (exports_guard.IsNumber(schema3.maximum) || exports_guard.IsBigInt(schema3.maximum));
}
// node_modules/typebox/build/schema/types/maxContains.mjs
function IsMaxContains(schema3) {
  return exports_guard.HasPropertyKey(schema3, "maxContains") && exports_guard.IsNumber(schema3.maxContains);
}
// node_modules/typebox/build/schema/types/maxItems.mjs
function IsMaxItems(schema3) {
  return exports_guard.HasPropertyKey(schema3, "maxItems") && exports_guard.IsNumber(schema3.maxItems);
}
// node_modules/typebox/build/schema/types/maxLength.mjs
function IsMaxLength3(schema3) {
  return exports_guard.HasPropertyKey(schema3, "maxLength") && exports_guard.IsNumber(schema3.maxLength);
}
// node_modules/typebox/build/schema/types/maxProperties.mjs
function IsMaxProperties(schema3) {
  return exports_guard.HasPropertyKey(schema3, "maxProperties") && exports_guard.IsNumber(schema3.maxProperties);
}
// node_modules/typebox/build/schema/types/minimum.mjs
function IsMinimum(schema3) {
  return exports_guard.HasPropertyKey(schema3, "minimum") && (exports_guard.IsNumber(schema3.minimum) || exports_guard.IsBigInt(schema3.minimum));
}
// node_modules/typebox/build/schema/types/minContains.mjs
function IsMinContains(schema3) {
  return exports_guard.HasPropertyKey(schema3, "minContains") && exports_guard.IsNumber(schema3.minContains);
}
// node_modules/typebox/build/schema/types/minItems.mjs
function IsMinItems(schema3) {
  return exports_guard.HasPropertyKey(schema3, "minItems") && exports_guard.IsNumber(schema3.minItems);
}
// node_modules/typebox/build/schema/types/minLength.mjs
function IsMinLength3(schema3) {
  return exports_guard.HasPropertyKey(schema3, "minLength") && exports_guard.IsNumber(schema3.minLength);
}
// node_modules/typebox/build/schema/types/minProperties.mjs
function IsMinProperties(schema3) {
  return exports_guard.HasPropertyKey(schema3, "minProperties") && exports_guard.IsNumber(schema3.minProperties);
}
// node_modules/typebox/build/schema/types/multipleOf.mjs
function IsMultipleOf2(schema3) {
  return exports_guard.HasPropertyKey(schema3, "multipleOf") && (exports_guard.IsNumber(schema3.multipleOf) || exports_guard.IsBigInt(schema3.multipleOf));
}
// node_modules/typebox/build/schema/types/not.mjs
function IsNot3(schema3) {
  return exports_guard.HasPropertyKey(schema3, "not") && IsSchema3(schema3.not);
}
// node_modules/typebox/build/schema/types/oneOf.mjs
function IsOneOf(schema3) {
  return exports_guard.HasPropertyKey(schema3, "oneOf") && exports_guard.IsArray(schema3.oneOf) && schema3.oneOf.every((value2) => IsSchema3(value2));
}
// node_modules/typebox/build/schema/types/pattern.mjs
function IsPattern2(schema3) {
  return exports_guard.HasPropertyKey(schema3, "pattern") && (exports_guard.IsString(schema3.pattern) || schema3.pattern instanceof RegExp);
}
// node_modules/typebox/build/schema/types/patternProperties.mjs
function IsPatternProperties(schema3) {
  return exports_guard.HasPropertyKey(schema3, "patternProperties") && exports_guard.IsObject(schema3.patternProperties) && Object.values(schema3.patternProperties).every((value2) => IsSchema3(value2));
}
// node_modules/typebox/build/schema/types/prefixItems.mjs
function IsPrefixItems(schema3) {
  return exports_guard.HasPropertyKey(schema3, "prefixItems") && exports_guard.IsArray(schema3.prefixItems) && schema3.prefixItems.every((schema4) => IsSchema3(schema4));
}
// node_modules/typebox/build/schema/types/properties.mjs
function IsProperties2(schema3) {
  return exports_guard.HasPropertyKey(schema3, "properties") && exports_guard.IsObject(schema3.properties) && Object.values(schema3.properties).every((value2) => IsSchema3(value2));
}
// node_modules/typebox/build/schema/types/propertyNames.mjs
function IsPropertyNames(schema3) {
  return exports_guard.HasPropertyKey(schema3, "propertyNames") && (exports_guard.IsObject(schema3.propertyNames) || IsSchema3(schema3.propertyNames));
}
// node_modules/typebox/build/schema/types/recursiveAnchor.mjs
function IsRecursiveAnchor(schema3) {
  return exports_guard.HasPropertyKey(schema3, "$recursiveAnchor") && exports_guard.IsBoolean(schema3.$recursiveAnchor);
}
function IsRecursiveAnchorTrue(schema3) {
  return IsRecursiveAnchor(schema3) && exports_guard.IsEqual(schema3.$recursiveAnchor, true);
}
// node_modules/typebox/build/schema/types/recursiveRef.mjs
function IsRecursiveRef(schema3) {
  return exports_guard.HasPropertyKey(schema3, "$recursiveRef") && exports_guard.IsString(schema3.$recursiveRef);
}
// node_modules/typebox/build/schema/types/ref.mjs
function IsRef3(schema3) {
  return exports_guard.HasPropertyKey(schema3, "$ref") && exports_guard.IsString(schema3.$ref);
}
// node_modules/typebox/build/schema/types/required.mjs
function IsRequired(schema3) {
  return exports_guard.HasPropertyKey(schema3, "required") && exports_guard.IsArray(schema3.required) && schema3.required.every((value2) => exports_guard.IsString(value2));
}
// node_modules/typebox/build/schema/types/then.mjs
function IsThen(schema3) {
  return exports_guard.HasPropertyKey(schema3, "then") && IsSchema3(schema3.then);
}
// node_modules/typebox/build/schema/types/type.mjs
function IsType(schema3) {
  return exports_guard.HasPropertyKey(schema3, "type") && (exports_guard.IsString(schema3.type) || exports_guard.IsArray(schema3.type) && schema3.type.every((value2) => exports_guard.IsString(value2)));
}
// node_modules/typebox/build/schema/types/uniqueItems.mjs
function IsUniqueItems(schema3) {
  return exports_guard.HasPropertyKey(schema3, "uniqueItems") && exports_guard.IsBoolean(schema3.uniqueItems);
}
// node_modules/typebox/build/schema/types/unevaluatedItems.mjs
function IsUnevaluatedItems(schema3) {
  return exports_guard.HasPropertyKey(schema3, "unevaluatedItems") && IsSchema3(schema3.unevaluatedItems);
}
// node_modules/typebox/build/schema/types/unevaluatedProperties.mjs
function IsUnevaluatedProperties(schema3) {
  return exports_guard.HasPropertyKey(schema3, "unevaluatedProperties") && IsSchema3(schema3.unevaluatedProperties);
}
// node_modules/typebox/build/schema/engine/_context.mjs
class CheckContext {
  constructor() {
    const indices = new Set;
    const keys = new Set;
    this.stack = [{ indices, keys }];
  }
  Push() {
    const indices = new Set;
    const keys = new Set;
    this.stack.push({ indices, keys });
    return true;
  }
  Pop() {
    this.stack.pop();
    return true;
  }
  AddIndex(index) {
    this.GetIndices().add(index);
    return true;
  }
  AddKey(key) {
    this.GetKeys().add(key);
    return true;
  }
  GetIndices() {
    const top = this.stack[this.stack.length - 1];
    return top.indices;
  }
  GetKeys() {
    const top = this.stack[this.stack.length - 1];
    return top.keys;
  }
  Merge(results) {
    for (const context of results) {
      context.GetIndices().forEach((value2) => this.GetIndices().add(value2));
      context.GetKeys().forEach((value2) => this.GetKeys().add(value2));
    }
    return true;
  }
}

class ErrorContext extends CheckContext {
  constructor(callback) {
    super();
    this.callback = callback;
  }
  AddError(error3) {
    this.callback(error3);
    return false;
  }
}

class AccumulatedErrorContext extends ErrorContext {
  constructor() {
    super((error3) => this.errors.push(error3));
    this.errors = [];
  }
  AddError(error3) {
    this.errors.push(error3);
    return false;
  }
  GetErrors() {
    return this.errors;
  }
}
// node_modules/typebox/build/system/hashing/hash.mjs
var exports_hash = {};
__export(exports_hash, {
  HashCode: () => HashCode,
  Hash: () => Hash
});

// node_modules/typebox/build/system/unreachable/unreachable.mjs
function Unreachable() {
  throw new Error("Unreachable");
}
// node_modules/typebox/build/system/hashing/hash.mjs
function InstanceKeys(value2) {
  const propertyKeys = new Set;
  let current = value2;
  while (current && current !== Object.prototype) {
    for (const key of Reflect.ownKeys(current)) {
      if (key !== "constructor" && typeof key !== "symbol")
        propertyKeys.add(key);
    }
    current = Object.getPrototypeOf(current);
  }
  return [...propertyKeys];
}
function IsIEEE754(value2) {
  return typeof value2 === "number";
}
var ByteMarker;
(function(ByteMarker2) {
  ByteMarker2[ByteMarker2["Array"] = 0] = "Array";
  ByteMarker2[ByteMarker2["BigInt"] = 1] = "BigInt";
  ByteMarker2[ByteMarker2["Boolean"] = 2] = "Boolean";
  ByteMarker2[ByteMarker2["Date"] = 3] = "Date";
  ByteMarker2[ByteMarker2["Constructor"] = 4] = "Constructor";
  ByteMarker2[ByteMarker2["Function"] = 5] = "Function";
  ByteMarker2[ByteMarker2["Null"] = 6] = "Null";
  ByteMarker2[ByteMarker2["Number"] = 7] = "Number";
  ByteMarker2[ByteMarker2["Object"] = 8] = "Object";
  ByteMarker2[ByteMarker2["RegExp"] = 9] = "RegExp";
  ByteMarker2[ByteMarker2["String"] = 10] = "String";
  ByteMarker2[ByteMarker2["Symbol"] = 11] = "Symbol";
  ByteMarker2[ByteMarker2["TypeArray"] = 12] = "TypeArray";
  ByteMarker2[ByteMarker2["Undefined"] = 13] = "Undefined";
})(ByteMarker || (ByteMarker = {}));
var Accumulator = BigInt("14695981039346656037");
var [Prime, Size] = [BigInt("1099511628211"), BigInt("18446744073709551616")];
var Bytes = Array.from({ length: 256 }).map((_2, i) => BigInt(i));
var F64 = new Float64Array(1);
var F64In = new DataView(F64.buffer);
var F64Out = new Uint8Array(F64.buffer);
function FNV1A64_OP(byte) {
  Accumulator = Accumulator ^ Bytes[byte];
  Accumulator = Accumulator * Prime % Size;
}
function FromArray7(value2) {
  FNV1A64_OP(ByteMarker.Array);
  for (const item of value2) {
    FromValue2(item);
  }
}
function FromBigInt2(value2) {
  FNV1A64_OP(ByteMarker.BigInt);
  F64In.setBigInt64(0, value2);
  for (const byte of F64Out) {
    FNV1A64_OP(byte);
  }
}
function FromBoolean2(value2) {
  FNV1A64_OP(ByteMarker.Boolean);
  FNV1A64_OP(value2 ? 1 : 0);
}
function FromConstructor4(value2) {
  FNV1A64_OP(ByteMarker.Constructor);
  FromValue2(value2.toString());
}
function FromDate2(value2) {
  FNV1A64_OP(ByteMarker.Date);
  FromValue2(value2.getTime());
}
function FromFunction4(value2) {
  FNV1A64_OP(ByteMarker.Function);
  FromValue2(value2.toString());
}
function FromNull2(_value) {
  FNV1A64_OP(ByteMarker.Null);
}
function FromNumber2(value2) {
  FNV1A64_OP(ByteMarker.Number);
  F64In.setFloat64(0, value2, true);
  for (const byte of F64Out) {
    FNV1A64_OP(byte);
  }
}
function FromObject8(value2) {
  FNV1A64_OP(ByteMarker.Object);
  for (const key of InstanceKeys(value2).sort()) {
    FromValue2(key);
    FromValue2(value2[key]);
  }
}
function FromRegExp2(value2) {
  FNV1A64_OP(ByteMarker.RegExp);
  FromString2(value2.toString());
}
var encoder = new TextEncoder;
function FromString2(value2) {
  FNV1A64_OP(ByteMarker.String);
  for (const byte of encoder.encode(value2)) {
    FNV1A64_OP(byte);
  }
}
function FromSymbol2(value2) {
  FNV1A64_OP(ByteMarker.Symbol);
  FromValue2(value2.toString());
}
function FromTypeArray(value2) {
  FNV1A64_OP(ByteMarker.TypeArray);
  const buffer = new Uint8Array(value2.buffer);
  for (let i = 0;i < buffer.length; i++) {
    FNV1A64_OP(buffer[i]);
  }
}
function FromUndefined2(_value) {
  return FNV1A64_OP(ByteMarker.Undefined);
}
function FromValue2(value2) {
  return exports_globals.IsTypeArray(value2) ? FromTypeArray(value2) : exports_globals.IsDate(value2) ? FromDate2(value2) : exports_globals.IsRegExp(value2) ? FromRegExp2(value2) : exports_globals.IsBoolean(value2) ? FromBoolean2(value2.valueOf()) : exports_globals.IsString(value2) ? FromString2(value2.valueOf()) : exports_globals.IsNumber(value2) ? FromNumber2(value2.valueOf()) : IsIEEE754(value2) ? FromNumber2(value2) : exports_guard.IsArray(value2) ? FromArray7(value2) : exports_guard.IsBoolean(value2) ? FromBoolean2(value2) : exports_guard.IsBigInt(value2) ? FromBigInt2(value2) : exports_guard.IsConstructor(value2) ? FromConstructor4(value2) : exports_guard.IsNull(value2) ? FromNull2(value2) : exports_guard.IsObject(value2) ? FromObject8(value2) : exports_guard.IsString(value2) ? FromString2(value2) : exports_guard.IsSymbol(value2) ? FromSymbol2(value2) : exports_guard.IsUndefined(value2) ? FromUndefined2(value2) : exports_guard.IsFunction(value2) ? FromFunction4(value2) : Unreachable();
}
function HashCode(value2) {
  Accumulator = BigInt("14695981039346656037");
  FromValue2(value2);
  return Accumulator;
}
function Hash(value2) {
  return HashCode(value2).toString(16).padStart(16, "0");
}
// node_modules/typebox/build/schema/engine/_refine.mjs
function CheckRefine(_stack, _context, schema4, value2) {
  return exports_guard.Every(schema4["~refine"], 0, (refinement, _2) => refinement.check(value2));
}
function ErrorRefine(_stack, context, schemaPath, instancePath, schema4, value2) {
  return exports_guard.EveryAll(schema4["~refine"], 0, (refinement, index) => {
    return refinement.check(value2) || context.AddError({
      keyword: "~refine",
      schemaPath,
      instancePath,
      params: { index, message: refinement.error(value2) }
    });
  });
}

// node_modules/typebox/build/schema/engine/additionalItems.mjs
function IsValid(schema4) {
  return IsItems(schema4) && exports_guard.IsArray(schema4.items);
}
function CheckAdditionalItems(stack, context, schema4, value2) {
  if (!IsValid(schema4))
    return true;
  const isAdditionalItems = value2.every((item, index) => {
    return exports_guard.IsLessThan(index, schema4.items.length) || CheckSchemaPushStack(stack, context, schema4.additionalItems, item) && context.AddIndex(index);
  });
  return isAdditionalItems;
}
function ErrorAdditionalItems(stack, context, schemaPath, instancePath, schema4, value2) {
  if (!IsValid(schema4))
    return true;
  const isAdditionalItems = value2.every((item, index) => {
    const nextSchemaPath = `${schemaPath}/additionalItems`;
    const nextInstancePath = `${instancePath}/${index}`;
    return exports_guard.IsLessThan(index, schema4.items.length) || ErrorSchemaPushStack(stack, context, nextSchemaPath, nextInstancePath, schema4.additionalItems, item) && context.AddIndex(index);
  });
  return isAdditionalItems;
}

// node_modules/typebox/build/schema/engine/additionalProperties.mjs
function GetPropertyKeyAsPattern(key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `^${escaped}$`;
}
function GetPropertiesPattern(schema4) {
  const patterns3 = [];
  if (IsPatternProperties(schema4))
    patterns3.push(...exports_guard.Keys(schema4.patternProperties));
  if (IsProperties2(schema4))
    patterns3.push(...exports_guard.Keys(schema4.properties).map(GetPropertyKeyAsPattern));
  return exports_guard.IsEqual(patterns3.length, 0) ? "(?!)" : `(${patterns3.join("|")})`;
}
function CheckAdditionalProperties(stack, context, schema4, value2) {
  const regexp3 = new RegExp(GetPropertiesPattern(schema4));
  const isAdditionalProperties = exports_guard.Every(exports_guard.Keys(value2), 0, (key, _index) => {
    return regexp3.test(key) || CheckSchemaPushStack(stack, context, schema4.additionalProperties, value2[key]) && context.AddKey(key);
  });
  return isAdditionalProperties;
}
function ErrorAdditionalProperties(stack, context, schemaPath, instancePath, schema4, value2) {
  const regexp3 = new RegExp(GetPropertiesPattern(schema4));
  const additionalProperties2 = [];
  const isAdditionalProperties = exports_guard.EveryAll(exports_guard.Keys(value2), 0, (key, _index) => {
    const nextSchemaPath = `${schemaPath}/additionalProperties`;
    const nextInstancePath = `${instancePath}/${key}`;
    const nextContext = new AccumulatedErrorContext;
    const isAdditionalProperty = regexp3.test(key) || ErrorSchemaPushStack(stack, nextContext, nextSchemaPath, nextInstancePath, schema4.additionalProperties, value2[key]) && context.AddKey(key);
    if (!isAdditionalProperty)
      additionalProperties2.push(key);
    return isAdditionalProperty;
  });
  return isAdditionalProperties || context.AddError({
    keyword: "additionalProperties",
    schemaPath,
    instancePath,
    params: { additionalProperties: additionalProperties2 }
  });
}

// node_modules/typebox/build/schema/engine/allOf.mjs
function CheckAllOf(stack, context, schema4, value2) {
  const results = schema4.allOf.reduce((result, schema5) => {
    const nextContext = new CheckContext;
    return CheckSchema(stack, nextContext, schema5, value2) ? [...result, nextContext] : result;
  }, []);
  return exports_guard.IsEqual(results.length, schema4.allOf.length) && context.Merge(results);
}
function ErrorAllOf(stack, context, schemaPath, instancePath, schema4, value2) {
  const failedContexts = [];
  const results = schema4.allOf.reduce((result, schema5, index) => {
    const nextSchemaPath = `${schemaPath}/allOf/${index}`;
    const nextContext = new AccumulatedErrorContext;
    const isSchema = ErrorSchema(stack, nextContext, nextSchemaPath, instancePath, schema5, value2);
    if (!isSchema)
      failedContexts.push(nextContext);
    return isSchema ? [...result, nextContext] : result;
  }, []);
  const isAllOf = exports_guard.IsEqual(results.length, schema4.allOf.length) && context.Merge(results);
  if (!isAllOf)
    failedContexts.forEach((failed) => failed.GetErrors().forEach((error3) => context.AddError(error3)));
  return isAllOf;
}

// node_modules/typebox/build/schema/engine/anyOf.mjs
function CheckAnyOf(stack, context, schema4, value2) {
  const results = schema4.anyOf.reduce((result, schema5) => {
    const nextContext = new CheckContext;
    return CheckSchema(stack, nextContext, schema5, value2) ? [...result, nextContext] : result;
  }, []);
  return exports_guard.IsGreaterThan(results.length, 0) && context.Merge(results);
}
function ErrorAnyOf(stack, context, schemaPath, instancePath, schema4, value2) {
  const failedContexts = [];
  const results = schema4.anyOf.reduce((result, schema5, index) => {
    const nextContext = new AccumulatedErrorContext;
    const nextSchemaPath = `${schemaPath}/anyOf/${index}`;
    const isSchema = ErrorSchema(stack, nextContext, nextSchemaPath, instancePath, schema5, value2);
    if (!isSchema)
      failedContexts.push(nextContext);
    return isSchema ? [...result, nextContext] : result;
  }, []);
  const isAnyOf = exports_guard.IsGreaterThan(results.length, 0) && context.Merge(results);
  if (!isAnyOf)
    failedContexts.forEach((failed) => failed.GetErrors().forEach((error3) => context.AddError(error3)));
  return isAnyOf || context.AddError({
    keyword: "anyOf",
    schemaPath,
    instancePath,
    params: {}
  });
}

// node_modules/typebox/build/schema/engine/boolean.mjs
function CheckSchemaBoolean(_stack, _context, schema4, _value) {
  return schema4;
}
function ErrorSchemaBoolean(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckSchemaBoolean(stack, context, schema4, value2) || context.AddError({
    keyword: "boolean",
    schemaPath,
    instancePath,
    params: {}
  });
}

// node_modules/typebox/build/schema/engine/const.mjs
function CheckConst(_stack, _context, schema4, value2) {
  return exports_guard.IsValueLike(schema4.const) ? exports_guard.IsEqual(value2, schema4.const) : exports_guard.IsDeepEqual(value2, schema4.const);
}
function ErrorConst(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckConst(stack, context, schema4, value2) || context.AddError({
    keyword: "const",
    schemaPath,
    instancePath,
    params: { allowedValue: schema4.const }
  });
}

// node_modules/typebox/build/schema/engine/contains.mjs
function IsValid2(schema4) {
  return !(IsMinContains(schema4) && exports_guard.IsEqual(schema4.minContains, 0));
}
function CheckContains(stack, context, schema4, value2) {
  if (!IsValid2(schema4))
    return true;
  return !exports_guard.IsEqual(value2.length, 0) && value2.some((item) => CheckSchema(stack, context, schema4.contains, item));
}
function ErrorContains(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckContains(stack, context, schema4, value2) || context.AddError({
    keyword: "contains",
    schemaPath,
    instancePath,
    params: { minContains: 1 }
  });
}

// node_modules/typebox/build/schema/engine/dependencies.mjs
function CheckDependencies(stack, context, schema4, value2) {
  const isLength = exports_guard.IsEqual(exports_guard.Keys(value2).length, 0);
  const isEvery = exports_guard.Every(exports_guard.Entries(schema4.dependencies), 0, ([key, schema5]) => {
    return !exports_guard.HasPropertyKey(value2, key) || (exports_guard.IsArray(schema5) ? schema5.every((key2) => exports_guard.HasPropertyKey(value2, key2)) : CheckSchema(stack, context, schema5, value2));
  });
  return isLength || isEvery;
}
function ErrorDependencies(stack, context, schemaPath, instancePath, schema4, value2) {
  const isLength = exports_guard.IsEqual(exports_guard.Keys(value2).length, 0);
  const isEvery = exports_guard.EveryAll(exports_guard.Entries(schema4.dependencies), 0, ([key, schema5]) => {
    const nextSchemaPath = `${schemaPath}/dependencies/${key}`;
    return !exports_guard.HasPropertyKey(value2, key) || (exports_guard.IsArray(schema5) ? schema5.every((dependency) => exports_guard.HasPropertyKey(value2, dependency) || context.AddError({
      keyword: "dependencies",
      schemaPath,
      instancePath,
      params: { property: key, dependencies: schema5 }
    })) : ErrorSchema(stack, context, nextSchemaPath, instancePath, schema5, value2));
  });
  return isLength || isEvery;
}

// node_modules/typebox/build/schema/engine/dependentRequired.mjs
function CheckDependentRequired(_stack, _context, schema4, value2) {
  const isLength = exports_guard.IsEqual(exports_guard.Keys(value2).length, 0);
  const isEvery = exports_guard.Every(exports_guard.Entries(schema4.dependentRequired), 0, ([key, keys]) => {
    return !exports_guard.HasPropertyKey(value2, key) || keys.every((key2) => exports_guard.HasPropertyKey(value2, key2));
  });
  return isLength || isEvery;
}
function ErrorDependentRequired(_stack, context, schemaPath, instancePath, schema4, value2) {
  const isLength = exports_guard.IsEqual(exports_guard.Keys(value2).length, 0);
  const isEveryEntry = exports_guard.EveryAll(exports_guard.Entries(schema4.dependentRequired), 0, ([key, keys]) => {
    return !exports_guard.HasPropertyKey(value2, key) || exports_guard.EveryAll(keys, 0, (dependency) => exports_guard.HasPropertyKey(value2, dependency) || context.AddError({
      keyword: "dependentRequired",
      schemaPath,
      instancePath,
      params: { property: key, dependencies: keys }
    }));
  });
  return isLength || isEveryEntry;
}

// node_modules/typebox/build/schema/engine/dependentSchemas.mjs
function CheckDependentSchemas(stack, context, schema4, value2) {
  const isLength = exports_guard.IsEqual(exports_guard.Keys(value2).length, 0);
  const isEvery = exports_guard.Every(exports_guard.Entries(schema4.dependentSchemas), 0, ([key, schema5]) => {
    return !exports_guard.HasPropertyKey(value2, key) || CheckSchema(stack, context, schema5, value2);
  });
  return isLength || isEvery;
}
function ErrorDependentSchemas(stack, context, schemaPath, instancePath, schema4, value2) {
  const isLength = exports_guard.IsEqual(exports_guard.Keys(value2).length, 0);
  const isEvery = exports_guard.EveryAll(exports_guard.Entries(schema4.dependentSchemas), 0, ([key, schema5]) => {
    const nextSchemaPath = `${schemaPath}/dependentSchemas/${key}`;
    return !exports_guard.HasPropertyKey(value2, key) || ErrorSchema(stack, context, nextSchemaPath, instancePath, schema5, value2);
  });
  return isLength || isEvery;
}

// node_modules/typebox/build/schema/engine/dynamicRef.mjs
function CheckDynamicRef(stack, context, schema4, value2) {
  const target = stack.DynamicRef(schema4) ?? false;
  return IsSchema3(target) && CheckSchema(stack, context, target, value2);
}
function ErrorDynamicRef(stack, context, _schemaPath, instancePath, schema4, value2) {
  const target = stack.DynamicRef(schema4) ?? false;
  return IsSchema3(target) && ErrorSchema(stack, context, "#", instancePath, target, value2);
}

// node_modules/typebox/build/schema/engine/enum.mjs
function CheckEnum(_stack, _context, schema4, value2) {
  return schema4.enum.some((option) => exports_guard.IsValueLike(option) ? exports_guard.IsEqual(value2, option) : exports_guard.IsDeepEqual(value2, option));
}
function ErrorEnum(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckEnum(stack, context, schema4, value2) || context.AddError({
    keyword: "enum",
    schemaPath,
    instancePath,
    params: { allowedValues: schema4.enum }
  });
}

// node_modules/typebox/build/schema/engine/exclusiveMaximum.mjs
function CheckExclusiveMaximum(_stack, _context, schema4, value2) {
  return exports_guard.IsLessThan(value2, schema4.exclusiveMaximum);
}
function ErrorExclusiveMaximum(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckExclusiveMaximum(stack, context, schema4, value2) || context.AddError({
    keyword: "exclusiveMaximum",
    schemaPath,
    instancePath,
    params: { comparison: "<", limit: schema4.exclusiveMaximum }
  });
}

// node_modules/typebox/build/schema/engine/exclusiveMinimum.mjs
function CheckExclusiveMinimum(_stack, _context, schema4, value2) {
  return exports_guard.IsGreaterThan(value2, schema4.exclusiveMinimum);
}
function ErrorExclusiveMinimum(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckExclusiveMinimum(stack, context, schema4, value2) || context.AddError({
    keyword: "exclusiveMinimum",
    schemaPath,
    instancePath,
    params: { comparison: ">", limit: schema4.exclusiveMinimum }
  });
}

// node_modules/typebox/build/format/format.mjs
var exports_format2 = {};
__export(exports_format2, {
  Test: () => Test,
  Set: () => Set2,
  Reset: () => Reset,
  IsUuid: () => IsUuid,
  IsUrl: () => IsUrl,
  IsUriTemplate: () => IsUriTemplate,
  IsUriReference: () => IsUriReference,
  IsUri: () => IsUri,
  IsTime: () => IsTime,
  IsRelativeJsonPointer: () => IsRelativeJsonPointer,
  IsRegex: () => IsRegex,
  IsJsonPointerUriFragment: () => IsJsonPointerUriFragment,
  IsJsonPointer: () => IsJsonPointer,
  IsIriReference: () => IsIriReference,
  IsIri: () => IsIri,
  IsIdnHostname: () => IsIdnHostname,
  IsIdnEmail: () => IsIdnEmail,
  IsIPv6: () => IsIPv6,
  IsIPv4: () => IsIPv4,
  IsHostname: () => IsHostname,
  IsEmail: () => IsEmail,
  IsDuration: () => IsDuration,
  IsDateTime: () => IsDateTime,
  IsDate: () => IsDate5,
  Has: () => Has,
  Get: () => Get,
  Entries: () => Entries2,
  Clear: () => Clear
});

// node_modules/typebox/build/format/date.mjs
var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
function IsLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function IsDate5(value2) {
  const matches = DATE.exec(value2);
  if (!matches)
    return false;
  const year = +matches[1];
  const month = +matches[2];
  const day = +matches[3];
  return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && IsLeapYear(year) ? 29 : DAYS[month]);
}

// node_modules/typebox/build/format/time.mjs
var TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(?:Z|([+-])(\d\d):(\d\d))?$/i;
function IsTime(value2, strictTimeZone = true) {
  const matches = TIME.exec(value2);
  if (!matches)
    return false;
  const hr = +matches[1];
  const min = +matches[2];
  const sec = +matches[3];
  const tzSign = matches[4] === "-" ? -1 : 1;
  const tzH = +(matches[5] || 0);
  const tzM = +(matches[6] || 0);
  if (tzH > 23 || tzM > 59)
    return false;
  if (strictTimeZone && !matches[4] && value2.toLowerCase().indexOf("z") === -1) {
    return false;
  }
  if (hr <= 23 && min <= 59 && sec < 60)
    return true;
  const utcMin = min - tzM * tzSign;
  const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
  return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
}

// node_modules/typebox/build/format/date_time.mjs
function IsDateTime(value2, strictTimeZone = true) {
  const dateTime = value2.split(/T/i);
  return dateTime.length === 2 && IsDate5(dateTime[0]) && IsTime(dateTime[1], strictTimeZone);
}

// node_modules/typebox/build/format/duration.mjs
var Duration = /^P((\d+Y(\d+M(\d+D)?)?|\d+M(\d+D)?|\d+D)(T(\d+H(\d+M(\d+S)?)?|\d+M(\d+S)?|\d+S))?|T(\d+H(\d+M(\d+S)?)?|\d+M(\d+S)?|\d+S)|\d+W)$/;
function IsDuration(value2) {
  return Duration.test(value2);
}

// node_modules/typebox/build/format/email.mjs
var Email = /^(?!.*\.\.)[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;
function IsEmail(value2) {
  return Email.test(value2);
}

// node_modules/typebox/build/format/_puny.mjs
var PUNYCODE_BASE = 36;
var PUNYCODE_TMIN = 1;
var PUNYCODE_TMAX = 26;
var PUNYCODE_SKEW = 38;
var PUNYCODE_DAMP = 700;
var PUNYCODE_INITIAL_BIAS = 72;
var PUNYCODE_INITIAL_N = 128;
function Adapt(delta, numPoints, firstTime) {
  delta = firstTime ? Math.floor(delta / PUNYCODE_DAMP) : delta >> 1;
  delta += Math.floor(delta / numPoints);
  let k2 = 0;
  while (delta > (PUNYCODE_BASE - PUNYCODE_TMIN) * PUNYCODE_TMAX >> 1) {
    delta = Math.floor(delta / (PUNYCODE_BASE - PUNYCODE_TMIN));
    k2 += PUNYCODE_BASE;
  }
  return k2 + Math.floor((PUNYCODE_BASE - PUNYCODE_TMIN + 1) * delta / (delta + PUNYCODE_SKEW));
}
function Decode(value2) {
  const output = [];
  let n = PUNYCODE_INITIAL_N;
  let i = 0;
  let bias = PUNYCODE_INITIAL_BIAS;
  const delimIdx = value2.lastIndexOf("-");
  if (delimIdx > 0) {
    for (let j = 0;j < delimIdx; j++) {
      const cp = value2.charCodeAt(j);
      if (cp >= 128)
        throw new Error("Invalid punycode: non-basic before delimiter");
      output.push(cp);
    }
  }
  let inIdx = delimIdx < 0 ? 0 : delimIdx + 1;
  while (inIdx < value2.length) {
    const oldi = i;
    let w2 = 1;
    let k2 = PUNYCODE_BASE;
    while (true) {
      if (inIdx >= value2.length)
        throw new Error("Invalid punycode: unexpected end of input");
      const ch = value2.charCodeAt(inIdx++);
      let digit;
      if (ch >= 97 && ch <= 122)
        digit = ch - 97;
      else if (ch >= 48 && ch <= 57)
        digit = ch - 48 + 26;
      else if (ch >= 65 && ch <= 90)
        Unreachable();
      else
        throw new Error("Invalid punycode: bad digit character");
      i += digit * w2;
      const t = k2 <= bias ? PUNYCODE_TMIN : k2 >= bias + PUNYCODE_TMAX ? PUNYCODE_TMAX : k2 - bias;
      if (digit < t)
        break;
      w2 *= PUNYCODE_BASE - t;
      k2 += PUNYCODE_BASE;
    }
    const outLen = output.length + 1;
    bias = Adapt(i - oldi, outLen, oldi === 0);
    n += Math.floor(i / outLen);
    i %= outLen;
    output.splice(i, 0, n);
    i++;
  }
  return globalThis.String.fromCodePoint(...output);
}

// node_modules/typebox/build/format/_idna.mjs
function IsNonspacingMark(cp) {
  return /\p{Mn}/u.test(String.fromCodePoint(cp));
}
function IsSpacingCombiningMark(cp) {
  return /\p{Mc}/u.test(String.fromCodePoint(cp));
}
function IsEnclosingMark(cp) {
  return /\p{Me}/u.test(String.fromCodePoint(cp));
}
function IsCombiningMark2(cp) {
  return IsNonspacingMark(cp) || IsSpacingCombiningMark(cp) || IsEnclosingMark(cp);
}
var RFC5892_DISALLOWED = new Set([
  1600,
  2042,
  12334,
  12335,
  12337,
  12338,
  12339,
  12340,
  12341,
  12347
]);
var VIRAMA_CPS = new Set([
  2381,
  2509,
  2637,
  2765,
  2893,
  3021,
  3149,
  3277,
  3387,
  3388,
  3405,
  3530,
  6980,
  7082,
  7083,
  43456,
  69702,
  69759,
  69817,
  69939,
  69940,
  70080,
  70197,
  70477,
  70722,
  70850,
  71103,
  71231,
  71350,
  72767,
  73028,
  73029
]);
function IsGreek(cp) {
  return /\p{Script=Greek}/u.test(String.fromCodePoint(cp));
}
function IsHebrew(cp) {
  return /\p{Script=Hebrew}/u.test(String.fromCodePoint(cp));
}
function IsHiragana(cp) {
  return /\p{Script=Hiragana}/u.test(String.fromCodePoint(cp));
}
function IsKatakana(cp) {
  return /\p{Script=Katakana}/u.test(String.fromCodePoint(cp));
}
function IsHan(cp) {
  return /\p{Script=Han}/u.test(String.fromCodePoint(cp));
}
function IsArabicIndicDigit(cp) {
  return cp >= 1632 && cp <= 1641;
}
function IsExtendedArabicIndicDigit(cp) {
  return cp >= 1776 && cp <= 1785;
}
function IsVirama(cp) {
  return VIRAMA_CPS.has(cp);
}
function IsUnicodeLabel(value2) {
  if (value2.length === 0)
    return Unreachable();
  const cps = [...value2].map((c) => c.codePointAt(0));
  const len = cps.length;
  if (cps[0] === 45 || cps[len - 1] === 45)
    return false;
  if (len >= 4 && cps[2] === 45 && cps[3] === 45)
    return false;
  if (IsCombiningMark2(cps[0]))
    return false;
  let hasJapanese = false;
  let hasArabicIndic = false;
  let hasExtendedArabicIndic = false;
  for (let i = 0;i < len; i++) {
    const cp = cps[i];
    if (RFC5892_DISALLOWED.has(cp))
      return false;
    if (IsHiragana(cp) || IsKatakana(cp) || IsHan(cp))
      hasJapanese = true;
    if (IsArabicIndicDigit(cp))
      hasArabicIndic = true;
    if (IsExtendedArabicIndicDigit(cp))
      hasExtendedArabicIndic = true;
    const prev = cps[i - 1], next = cps[i + 1];
    switch (cp) {
      case 183:
        if (prev !== 108 || next !== 108)
          return false;
        break;
      case 885:
        if (next === undefined || !IsGreek(next))
          return false;
        break;
      case 1523:
      case 1524:
        if (prev === undefined || !IsHebrew(prev))
          return false;
        break;
      case 8204:
        if (prev === undefined || prev < 128 && !IsVirama(prev))
          return false;
        break;
      case 8205:
        if (prev === undefined || !IsVirama(prev))
          return false;
        break;
      case 12539:
        break;
    }
  }
  if (value2.includes("・") && !hasJapanese)
    return false;
  if (hasArabicIndic && hasExtendedArabicIndic)
    return false;
  return true;
}
function IsAsciiLabel(value2) {
  if (value2.charCodeAt(0) === 45 || value2.charCodeAt(value2.length - 1) === 45)
    return false;
  if (value2.length >= 4 && value2.charCodeAt(2) === 45 && value2.charCodeAt(3) === 45)
    return false;
  for (let i = 0;i < value2.length; i++) {
    const ch = value2.charCodeAt(i);
    if (!(ch >= 97 && ch <= 122 || ch >= 65 && ch <= 90 || ch >= 48 && ch <= 57 || ch === 45))
      return false;
  }
  return true;
}
function IsPuny(value2) {
  return value2.toLowerCase().startsWith("xn--");
}
function IsPunyLabel(value2) {
  try {
    const payload = value2.slice(4).toLowerCase();
    const lastHyphen = payload.lastIndexOf("-");
    if (lastHyphen === 0) {
      return false;
    }
    const decoded = Decode(payload);
    if (!decoded)
      return false;
    return IsUnicodeLabel(decoded);
  } catch {
    return false;
  }
}
function IsIdnLabel(value2) {
  if (value2.length === 0 || value2.length > 63)
    return false;
  return IsPuny(value2) ? IsPunyLabel(value2) : IsUnicodeLabel(value2);
}
function IsLabel(value2) {
  if (value2.length === 0 || value2.length > 63)
    return false;
  return IsPuny(value2) ? IsPunyLabel(value2) : IsAsciiLabel(value2);
}

// node_modules/typebox/build/format/hostname.mjs
function IsHostname(value2) {
  if (value2.length === 0 || value2.length > 253)
    return false;
  if (value2.charCodeAt(value2.length - 1) === 46)
    return false;
  for (const label of value2.split(".")) {
    if (!IsLabel(label))
      return false;
  }
  return true;
}

// node_modules/typebox/build/format/idn_email.mjs
var IdnEmail = /^(?!.*\.\.)[\p{L}\p{N}!#$%&'*+/=?^_`{|}~-]+(?:\.[\p{L}\p{N}!#$%&'*+/=?^_`{|}~-]+)*@[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?(?:\.[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?)*$/iu;
function IsIdnEmail(value2) {
  return IdnEmail.test(value2);
}

// node_modules/typebox/build/format/idn_hostname.mjs
function IsIdnHostname(value2) {
  if (value2.length === 0 || value2.includes(" "))
    return false;
  const canonical = value2.normalize("NFC").replace(/[\u002E\u3002\uFF0E\uFF61]/g, ".");
  if (canonical.length > 253)
    return false;
  for (const label of canonical.split(".")) {
    if (!IsIdnLabel(label))
      return false;
  }
  return true;
}

// node_modules/typebox/build/format/ipv4.mjs
function IsIPv4Internal(value2, start, end) {
  let dots = 0;
  let num = 0;
  let digits = 0;
  let leading = 0;
  for (let i = start;i < end; i++) {
    const ch = value2.charCodeAt(i);
    if (ch === 46) {
      if (digits === 0 || num > 255 || leading === 48 && digits > 1)
        return false;
      dots++;
      num = 0;
      digits = 0;
      leading = 0;
    } else if (ch >= 48 && ch <= 57) {
      if (digits === 0)
        leading = ch;
      num = num * 10 + (ch - 48);
      digits++;
    } else {
      return false;
    }
  }
  return dots === 3 && digits > 0 && num <= 255 && !(leading === 48 && digits > 1);
}
function IsIPv4(value2) {
  return IsIPv4Internal(value2, 0, value2.length);
}

// node_modules/typebox/build/format/ipv6.mjs
function InRange(ch) {
  return ch >= 48 && ch <= 57 || ch >= 65 && ch <= 70 || ch >= 97 && ch <= 102;
}
function IsIPv6(value2) {
  const length = value2.length;
  if (length === 0)
    return false;
  let groups = 0;
  let compressed = false;
  let i = 0;
  if (value2.charCodeAt(0) === 58 && value2.charCodeAt(1) === 58) {
    if (length === 2)
      return true;
    compressed = true;
    i = 2;
  }
  while (i < length) {
    let digits = 0;
    const start = i;
    while (i < length && InRange(value2.charCodeAt(i))) {
      i++;
      digits++;
    }
    if (digits === 0)
      return false;
    const next = value2.charCodeAt(i);
    if (next === 46) {
      if (!IsIPv4Internal(value2, start, length))
        return false;
      groups += 2;
      i = length;
      break;
    }
    if (digits > 4)
      return false;
    groups++;
    if (i === length)
      break;
    if (next !== 58)
      return false;
    i++;
    if (value2.charCodeAt(i) === 58) {
      if (compressed)
        return false;
      if (value2.charCodeAt(i + 1) === 58)
        return false;
      compressed = true;
      i++;
      if (i === length)
        break;
    }
  }
  return compressed ? groups <= 7 : groups === 8;
}

// node_modules/typebox/build/format/iri_reference.mjs
function TryUrl(value2) {
  try {
    new URL(value2, "http://example.com");
    return true;
  } catch {
    return false;
  }
}
function IsIriReference(value2) {
  if (value2.includes(" ")) {
    return false;
  }
  if (value2.includes("\\")) {
    return false;
  }
  if (/[\x00-\x1F\x7F]/.test(value2)) {
    return false;
  }
  if (/%(?![0-9a-fA-F]{2})/.test(value2)) {
    return false;
  }
  if (value2 === "") {
    return true;
  }
  const colonIndex = value2.indexOf(":");
  const hasValidSchemePrefix = colonIndex > 0 && /^[a-zA-Z][a-zA-Z0-9+\-.]*$/.test(value2.substring(0, colonIndex));
  if (hasValidSchemePrefix) {
    return TryUrl(value2);
  } else {
    const looksLikeMalformedSchemeAndAuthority = value2.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*)(\/\/)/);
    if (looksLikeMalformedSchemeAndAuthority && colonIndex === -1) {
      return false;
    }
    return TryUrl(value2);
  }
}

// node_modules/typebox/build/format/iri.mjs
function IsIri(value2) {
  try {
    new URL(value2);
    return true;
  } catch {
    return false;
  }
}

// node_modules/typebox/build/format/json_pointer_uri_fragment.mjs
var JsonPointerUriFragment = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
function IsJsonPointerUriFragment(value2) {
  return JsonPointerUriFragment.test(value2);
}

// node_modules/typebox/build/format/json_pointer.mjs
var JsonPointer = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
function IsJsonPointer(value2) {
  return JsonPointer.test(value2);
}

// node_modules/typebox/build/format/regex.mjs
function IsRegex(value2) {
  if (value2.length === 0) {
    return false;
  }
  try {
    new RegExp(value2);
    return true;
  } catch {
    return false;
  }
}

// node_modules/typebox/build/format/relative_json_pointer.mjs
var RelativeJsonPointer = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
function IsRelativeJsonPointer(value2) {
  return RelativeJsonPointer.test(value2);
}

// node_modules/typebox/build/format/uri_reference.mjs
var UriReference = /^(?!.*[^\x00-\x7F])(?!.*\\)(?:(?:[a-z][a-z0-9+\-.]*:)?(?:\/\/[^\s[\]{}<>^`|]*)?|[^\s[\]{}<>^`|]*)(?:\?[^\s[\]{}<>^`|]*)?(?:#[^\s[\]{}<>^`|]*)?$/i;
function IsUriReference(value2) {
  return UriReference.test(value2);
}

// node_modules/typebox/build/format/uri_template.mjs
var UriTemplate = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
function IsUriTemplate(value2) {
  return UriTemplate.test(value2);
}

// node_modules/typebox/build/format/uri.mjs
function IsAlpha(ch) {
  return ch >= 97 && ch <= 122 || ch >= 65 && ch <= 90;
}
function IsAlphaNumeric(ch) {
  return IsAlpha(ch) || ch >= 48 && ch <= 57;
}
function IsHex(ch) {
  return ch >= 48 && ch <= 57 || ch >= 65 && ch <= 70 || ch >= 97 && ch <= 102;
}
function IsSchemeChar(ch) {
  return IsAlphaNumeric(ch) || ch === 43 || ch === 45 || ch === 46;
}
function IsUnreserved(ch) {
  return IsAlphaNumeric(ch) || ch === 45 || ch === 46 || ch === 95 || ch === 126;
}
function IsSubDelim(ch) {
  return ch === 33 || ch === 36 || ch === 38 || ch === 39 || ch === 40 || ch === 41 || ch === 42 || ch === 43 || ch === 44 || ch === 59 || ch === 61;
}
function IsPchar(ch) {
  return IsUnreserved(ch) || IsSubDelim(ch) || ch === 58 || ch === 64;
}
function IsUri(value2) {
  const length = value2.length;
  if (length === 0)
    return false;
  if (!IsAlpha(value2.charCodeAt(0)))
    return false;
  let i = 1;
  while (i < length) {
    const ch = value2.charCodeAt(i);
    if (ch === 58)
      break;
    if (!IsSchemeChar(ch))
      return false;
    i++;
  }
  if (value2.charCodeAt(i) !== 58)
    return false;
  i++;
  if (value2.charCodeAt(i) === 47 && value2.charCodeAt(i + 1) === 47) {
    i += 2;
    const authorityStart = i;
    let atPos = -1;
    for (let j = i;j < length; j++) {
      const ch = value2.charCodeAt(j);
      if (ch === 64) {
        atPos = j;
        break;
      }
      if (ch === 47 || ch === 63 || ch === 35)
        break;
    }
    if (atPos !== -1) {
      for (let j = authorityStart;j < atPos; j++) {
        const ch = value2.charCodeAt(j);
        if (ch === 91 || ch === 93)
          return false;
        if (ch === 37) {
          if (j + 2 >= atPos || !IsHex(value2.charCodeAt(j + 1)) || !IsHex(value2.charCodeAt(j + 2)))
            return false;
          j += 2;
        } else if (!IsUnreserved(ch) && !IsSubDelim(ch) && ch !== 58)
          return false;
      }
      i = atPos + 1;
    }
    if (value2.charCodeAt(i) === 91) {
      i++;
      while (i < length && value2.charCodeAt(i) !== 93)
        i++;
      if (value2.charCodeAt(i) !== 93)
        return false;
      i++;
    } else {
      while (i < length) {
        const ch = value2.charCodeAt(i);
        if (ch === 47 || ch === 63 || ch === 35 || ch === 58)
          break;
        if (ch < 128 && !IsUnreserved(ch) && !IsSubDelim(ch))
          return false;
        i++;
      }
    }
    if (value2.charCodeAt(i) === 58) {
      i++;
      while (i < length) {
        const ch = value2.charCodeAt(i);
        if (ch === 47 || ch === 63 || ch === 35)
          break;
        if (ch < 48 || ch > 57)
          return false;
        i++;
      }
    }
  }
  while (i < length) {
    const ch = value2.charCodeAt(i);
    if (ch === 37) {
      if (i + 2 >= length || !IsHex(value2.charCodeAt(i + 1)) || !IsHex(value2.charCodeAt(i + 2)))
        return false;
      i += 2;
    } else if (ch > 127) {
      return false;
    } else if (!(IsPchar(ch) || ch === 47 || ch === 63 || ch === 35)) {
      return false;
    }
    i++;
  }
  return true;
}

// node_modules/typebox/build/format/url.mjs
var Url = /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu;
function IsUrl(value2) {
  return Url.test(value2);
}

// node_modules/typebox/build/format/uuid.mjs
var Uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function IsUuid(value2) {
  return Uuid.test(value2);
}

// node_modules/typebox/build/format/_registry.mjs
var formats = new Map;
function Clear() {
  formats.clear();
}
function Entries2() {
  return [...formats.entries()];
}
function Set2(format2, check) {
  formats.set(format2, check);
}
function Has(format2) {
  return formats.has(format2);
}
function Get(format2) {
  return formats.get(format2);
}
function Test(format2, value2) {
  return formats.get(format2)?.(value2) ?? true;
}
function Reset() {
  Clear();
  formats.set("date-time", IsDateTime);
  formats.set("date", IsDate5);
  formats.set("duration", IsDuration);
  formats.set("email", IsEmail);
  formats.set("hostname", IsHostname);
  formats.set("idn-email", IsIdnEmail);
  formats.set("idn-hostname", IsIdnHostname);
  formats.set("ipv4", IsIPv4);
  formats.set("ipv6", IsIPv6);
  formats.set("iri-reference", IsIriReference);
  formats.set("iri", IsIri);
  formats.set("json-pointer-uri-fragment", IsJsonPointerUriFragment);
  formats.set("json-pointer", IsJsonPointer);
  formats.set("regex", IsRegex);
  formats.set("relative-json-pointer", IsRelativeJsonPointer);
  formats.set("time", IsTime);
  formats.set("uri-reference", IsUriReference);
  formats.set("uri-template", IsUriTemplate);
  formats.set("uri", IsUri);
  formats.set("url", IsUrl);
  formats.set("uuid", IsUuid);
}
Reset();
// node_modules/typebox/build/schema/engine/format.mjs
function CheckFormat(_stack, _context, schema4, value2) {
  return exports_format2.Test(schema4.format, value2);
}
function ErrorFormat(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckFormat(stack, context, schema4, value2) || context.AddError({
    keyword: "format",
    schemaPath,
    instancePath,
    params: { format: schema4.format }
  });
}

// node_modules/typebox/build/schema/engine/if.mjs
function CheckIf(stack, context, schema4, value2) {
  const thenSchema = IsThen(schema4) ? schema4.then : true;
  const elseSchema = IsElse(schema4) ? schema4.else : true;
  return CheckSchema(stack, context, schema4.if, value2) ? CheckSchema(stack, context, thenSchema, value2) : CheckSchema(stack, context, elseSchema, value2);
}
function ErrorIf(stack, context, schemaPath, instancePath, schema4, value2) {
  const thenSchema = IsThen(schema4) ? schema4.then : true;
  const elseSchema = IsElse(schema4) ? schema4.else : true;
  const trueContext = new AccumulatedErrorContext;
  const isIf = ErrorSchema(stack, trueContext, `${schemaPath}/if`, instancePath, schema4.if, value2) ? ErrorSchema(stack, trueContext, `${schemaPath}/then`, instancePath, thenSchema, value2) || context.AddError({
    keyword: "if",
    schemaPath,
    instancePath,
    params: { failingKeyword: "then" }
  }) : ErrorSchema(stack, context, `${schemaPath}/else`, instancePath, elseSchema, value2) || context.AddError({
    keyword: "if",
    schemaPath,
    instancePath,
    params: { failingKeyword: "else" }
  });
  if (isIf)
    context.Merge([trueContext]);
  return isIf;
}

// node_modules/typebox/build/schema/engine/items.mjs
function CheckItemsSized(stack, context, schema4, value2) {
  return exports_guard.Every(schema4.items, 0, (schema5, index) => {
    return exports_guard.IsLessEqualThan(value2.length, index) || CheckSchemaPushStack(stack, context, schema5, value2[index]) && context.AddIndex(index);
  });
}
function ErrorItemsSized(stack, context, schemaPath, instancePath, schema4, value2) {
  return exports_guard.EveryAll(schema4.items, 0, (schema5, index) => {
    const nextSchemaPath = `${schemaPath}/items/${index}`;
    const nextInstancePath = `${instancePath}/${index}`;
    return exports_guard.IsLessEqualThan(value2.length, index) || ErrorSchemaPushStack(stack, context, nextSchemaPath, nextInstancePath, schema5, value2[index]) && context.AddIndex(index);
  });
}
function CheckItemsUnsized(stack, context, schema4, value2) {
  const offset = IsPrefixItems(schema4) ? schema4.prefixItems.length : 0;
  return exports_guard.Every(value2, offset, (element, index) => {
    return CheckSchemaPushStack(stack, context, schema4.items, element) && context.AddIndex(index);
  });
}
function ErrorItemsUnsized(stack, context, schemaPath, instancePath, schema4, value2) {
  const offset = IsPrefixItems(schema4) ? schema4.prefixItems.length : 0;
  return exports_guard.EveryAll(value2, offset, (element, index) => {
    const nextSchemaPath = `${schemaPath}/items`;
    const nextInstancePath = `${instancePath}/${index}`;
    return ErrorSchemaPushStack(stack, context, nextSchemaPath, nextInstancePath, schema4.items, element) && context.AddIndex(index);
  });
}
function CheckItems(stack, context, schema4, value2) {
  return IsItemsSized(schema4) ? CheckItemsSized(stack, context, schema4, value2) : CheckItemsUnsized(stack, context, schema4, value2);
}
function ErrorItems(stack, context, schemaPath, instancePath, schema4, value2) {
  return IsItemsSized(schema4) ? ErrorItemsSized(stack, context, schemaPath, instancePath, schema4, value2) : ErrorItemsUnsized(stack, context, schemaPath, instancePath, schema4, value2);
}

// node_modules/typebox/build/schema/engine/maxContains.mjs
function IsValid3(schema4) {
  return IsContains(schema4);
}
function CheckMaxContains(stack, context, schema4, value2) {
  if (!IsValid3(schema4))
    return true;
  const count = value2.reduce((result, item) => CheckSchema(stack, context, schema4.contains, item) ? ++result : result, 0);
  return exports_guard.IsLessEqualThan(count, schema4.maxContains);
}
function ErrorMaxContains(stack, context, schemaPath, instancePath, schema4, value2) {
  const minContains2 = IsMinContains(schema4) ? schema4.minContains : 1;
  return CheckMaxContains(stack, context, schema4, value2) || context.AddError({
    keyword: "contains",
    schemaPath,
    instancePath,
    params: { minContains: minContains2, maxContains: schema4.maxContains }
  });
}

// node_modules/typebox/build/schema/engine/maximum.mjs
function CheckMaximum(_stack, _context, schema4, value2) {
  return exports_guard.IsLessEqualThan(value2, schema4.maximum);
}
function ErrorMaximum(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckMaximum(stack, context, schema4, value2) || context.AddError({
    keyword: "maximum",
    schemaPath,
    instancePath,
    params: { comparison: "<=", limit: schema4.maximum }
  });
}

// node_modules/typebox/build/schema/engine/maxItems.mjs
function CheckMaxItems(_stack, _context, schema4, value2) {
  return exports_guard.IsLessEqualThan(value2.length, schema4.maxItems);
}
function ErrorMaxItems(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckMaxItems(stack, context, schema4, value2) || context.AddError({
    keyword: "maxItems",
    schemaPath,
    instancePath,
    params: { limit: schema4.maxItems }
  });
}

// node_modules/typebox/build/schema/engine/maxLength.mjs
function CheckMaxLength(_stack, _context, schema4, value2) {
  return exports_guard.IsMaxLength(value2, schema4.maxLength);
}
function ErrorMaxLength(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckMaxLength(stack, context, schema4, value2) || context.AddError({
    keyword: "maxLength",
    schemaPath,
    instancePath,
    params: { limit: schema4.maxLength }
  });
}

// node_modules/typebox/build/schema/engine/maxProperties.mjs
function CheckMaxProperties(_stack, _context, schema4, value2) {
  return exports_guard.IsLessEqualThan(exports_guard.Keys(value2).length, schema4.maxProperties);
}
function ErrorMaxProperties(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckMaxProperties(stack, context, schema4, value2) || context.AddError({
    keyword: "maxProperties",
    schemaPath,
    instancePath,
    params: { limit: schema4.maxProperties }
  });
}

// node_modules/typebox/build/schema/engine/minContains.mjs
function IsValid4(schema4) {
  return IsContains(schema4);
}
function CheckMinContains(stack, context, schema4, value2) {
  if (!IsValid4(schema4))
    return true;
  const count = value2.reduce((result, item) => CheckSchema(stack, context, schema4.contains, item) ? ++result : result, 0);
  return exports_guard.IsGreaterEqualThan(count, schema4.minContains);
}
function ErrorMinContains(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckMinContains(stack, context, schema4, value2) || context.AddError({
    keyword: "contains",
    schemaPath,
    instancePath,
    params: { minContains: schema4.minContains }
  });
}

// node_modules/typebox/build/schema/engine/minimum.mjs
function CheckMinimum(_stack, _context, schema4, value2) {
  return exports_guard.IsGreaterEqualThan(value2, schema4.minimum);
}
function ErrorMinimum(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckMinimum(stack, context, schema4, value2) || context.AddError({
    keyword: "minimum",
    schemaPath,
    instancePath,
    params: { comparison: ">=", limit: schema4.minimum }
  });
}

// node_modules/typebox/build/schema/engine/minItems.mjs
function CheckMinItems(_stack, _context, schema4, value2) {
  return exports_guard.IsGreaterEqualThan(value2.length, schema4.minItems);
}
function ErrorMinItems(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckMinItems(stack, context, schema4, value2) || context.AddError({
    keyword: "minItems",
    schemaPath,
    instancePath,
    params: { limit: schema4.minItems }
  });
}

// node_modules/typebox/build/schema/engine/minLength.mjs
function CheckMinLength(_stack, _context, schema4, value2) {
  return exports_guard.IsMinLength(value2, schema4.minLength);
}
function ErrorMinLength(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckMinLength(stack, context, schema4, value2) || context.AddError({
    keyword: "minLength",
    schemaPath,
    instancePath,
    params: { limit: schema4.minLength }
  });
}

// node_modules/typebox/build/schema/engine/minProperties.mjs
function CheckMinProperties(_stack, _context, schema4, value2) {
  return exports_guard.IsGreaterEqualThan(exports_guard.Keys(value2).length, schema4.minProperties);
}
function ErrorMinProperties(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckMinProperties(stack, context, schema4, value2) || context.AddError({
    keyword: "minProperties",
    schemaPath,
    instancePath,
    params: { limit: schema4.minProperties }
  });
}

// node_modules/typebox/build/schema/engine/multipleOf.mjs
function CheckMultipleOf(_stack, _context, schema4, value2) {
  return exports_guard.IsMultipleOf(value2, schema4.multipleOf);
}
function ErrorMultipleOf(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckMultipleOf(stack, context, schema4, value2) || context.AddError({
    keyword: "multipleOf",
    schemaPath,
    instancePath,
    params: { multipleOf: schema4.multipleOf }
  });
}

// node_modules/typebox/build/schema/engine/not.mjs
function CheckNot(stack, context, schema4, value2) {
  const nextContext = new CheckContext;
  const isSchema = !CheckSchema(stack, nextContext, schema4.not, value2);
  const isNot = isSchema && context.Merge([nextContext]);
  return isNot;
}
function ErrorNot(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckNot(stack, context, schema4, value2) || context.AddError({
    keyword: "not",
    schemaPath,
    instancePath,
    params: {}
  });
}

// node_modules/typebox/build/schema/engine/oneOf.mjs
function CheckOneOf(stack, context, schema4, value2) {
  const passedContexts = schema4.oneOf.reduce((result, schema5) => {
    const nextContext = new CheckContext;
    return CheckSchema(stack, nextContext, schema5, value2) ? [...result, nextContext] : result;
  }, []);
  return exports_guard.IsEqual(passedContexts.length, 1) && context.Merge(passedContexts);
}
function ErrorOneOf(stack, context, schemaPath, instancePath, schema4, value2) {
  const failedContexts = [];
  const passingSchemas = [];
  const passedContexts = schema4.oneOf.reduce((result, schema5, index) => {
    const nextContext = new AccumulatedErrorContext;
    const nextSchemaPath = `${schemaPath}/oneOf/${index}`;
    const isSchema = ErrorSchema(stack, nextContext, nextSchemaPath, instancePath, schema5, value2);
    if (isSchema)
      passingSchemas.push(index);
    if (!isSchema)
      failedContexts.push(nextContext);
    return isSchema ? [...result, nextContext] : result;
  }, []);
  const isOneOf = exports_guard.IsEqual(passedContexts.length, 1) && context.Merge(passedContexts);
  if (!isOneOf && exports_guard.IsEqual(passingSchemas.length, 0))
    failedContexts.forEach((failed) => failed.GetErrors().forEach((error3) => context.AddError(error3)));
  return isOneOf || context.AddError({
    keyword: "oneOf",
    schemaPath,
    instancePath,
    params: { passingSchemas }
  });
}

// node_modules/typebox/build/schema/engine/pattern.mjs
function CheckPattern(_stack, _context, schema4, value2) {
  const regexp3 = exports_guard.IsString(schema4.pattern) ? new RegExp(schema4.pattern, "u") : schema4.pattern;
  return regexp3.test(value2);
}
function ErrorPattern(stack, context, schemaPath, instancePath, schema4, value2) {
  return CheckPattern(stack, context, schema4, value2) || context.AddError({
    keyword: "pattern",
    schemaPath,
    instancePath,
    params: { pattern: schema4.pattern }
  });
}

// node_modules/typebox/build/schema/engine/patternProperties.mjs
function CheckPatternProperties(stack, context, schema4, value2) {
  return exports_guard.Every(exports_guard.Entries(schema4.patternProperties), 0, ([pattern3, schema5]) => {
    const regexp3 = new RegExp(pattern3, "u");
    return exports_guard.Every(exports_guard.Entries(value2), 0, ([key, prop]) => {
      return !regexp3.test(key) || CheckSchemaPushStack(stack, context, schema5, prop) && context.AddKey(key);
    });
  });
}
function ErrorPatternProperties(stack, context, schemaPath, instancePath, schema4, value2) {
  return exports_guard.EveryAll(exports_guard.Entries(schema4.patternProperties), 0, ([pattern3, schema5]) => {
    const nextSchemaPath = `${schemaPath}/patternProperties/${pattern3}`;
    const regexp3 = new RegExp(pattern3, "u");
    return exports_guard.EveryAll(exports_guard.Entries(value2), 0, ([key, value3]) => {
      const nextInstancePath = `${instancePath}/${key}`;
      const notKey = !regexp3.test(key);
      return notKey || ErrorSchemaPushStack(stack, context, nextSchemaPath, nextInstancePath, schema5, value3) && context.AddKey(key);
    });
  });
}

// node_modules/typebox/build/schema/engine/prefixItems.mjs
function CheckPrefixItems(stack, context, schema4, value2) {
  return exports_guard.IsEqual(value2.length, 0) || exports_guard.Every(schema4.prefixItems, 0, (schema5, index) => {
    return exports_guard.IsLessEqualThan(value2.length, index) || CheckSchemaPushStack(stack, context, schema5, value2[index]) && context.AddIndex(index);
  });
}
function ErrorPrefixItems(stack, context, schemaPath, instancePath, schema4, value2) {
  return exports_guard.IsEqual(value2.length, 0) || exports_guard.EveryAll(schema4.prefixItems, 0, (schema5, index) => {
    const nextSchemaPath = `${schemaPath}/prefixItems/${index}`;
    const nextInstancePath = `${instancePath}/${index}`;
    return exports_guard.IsLessEqualThan(value2.length, index) || ErrorSchemaPushStack(stack, context, nextSchemaPath, nextInstancePath, schema5, value2[index]) && context.AddIndex(index);
  });
}

// node_modules/typebox/build/system/settings/settings.mjs
var exports_settings = {};
__export(exports_settings, {
  Set: () => Set3,
  Reset: () => Reset2,
  Get: () => Get2
});
var settings = {
  immutableTypes: false,
  maxErrors: 8,
  useAcceleration: true,
  exactOptionalPropertyTypes: false,
  enumerableKind: false,
  correctiveParse: false,
  unionPrioritySort: true
};
function Reset2() {
  settings.immutableTypes = false;
  settings.maxErrors = 8;
  settings.useAcceleration = true;
  settings.exactOptionalPropertyTypes = false;
  settings.enumerableKind = false;
  settings.correctiveParse = false;
  settings.unionPrioritySort = true;
}
function Set3(options) {
  for (const key of exports_guard.Keys(options)) {
    const value2 = options[key];
    if (value2 !== undefined) {
      Object.defineProperty(settings, key, { value: value2 });
    }
  }
}
function Get2() {
  return settings;
}
// node_modules/typebox/build/schema/engine/_exact_optional.mjs
function IsExactOptional(required4, key) {
  return required4.includes(key) || exports_settings.Get().exactOptionalPropertyTypes;
}
function InexactOptionalCheck(value2, key) {
  return exports_guard.IsUndefined(value2[key]);
}

// node_modules/typebox/build/schema/engine/properties.mjs
function CheckProperties(stack, context, schema4, value2) {
  const required4 = IsRequired(schema4) ? schema4.required : [];
  const isProperties = exports_guard.Every(exports_guard.Entries(schema4.properties), 0, ([key, schema5]) => {
    const isProperty = !exports_guard.HasPropertyKey(value2, key) || CheckSchemaPushStack(stack, context, schema5, value2[key]) && context.AddKey(key);
    return IsExactOptional(required4, key) ? isProperty : InexactOptionalCheck(value2, key) || isProperty;
  });
  return isProperties;
}
function ErrorProperties(stack, context, schemaPath, instancePath, schema4, value2) {
  const required4 = IsRequired(schema4) ? schema4.required : [];
  const isProperties = exports_guard.EveryAll(exports_guard.Entries(schema4.properties), 0, ([key, schema5]) => {
    const nextSchemaPath = `${schemaPath}/properties/${key}`;
    const nextInstancePath = `${instancePath}/${key}`;
    const isProperty = () => !exports_guard.HasPropertyKey(value2, key) || ErrorSchemaPushStack(stack, context, nextSchemaPath, nextInstancePath, schema5, value2[key]) && context.AddKey(key);
    return IsExactOptional(required4, key) ? isProperty() : InexactOptionalCheck(value2, key) || isProperty();
  });
  return isProperties;
}

// node_modules/typebox/build/schema/engine/propertyNames.mjs
function CheckPropertyNames(stack, context, schema4, value2) {
  return exports_guard.Every(exports_guard.Keys(value2), 0, (key, _index) => CheckSchema(stack, context, schema4.propertyNames, key));
}
function ErrorPropertyNames(stack, context, schemaPath, instancePath, schema4, value2) {
  const propertyNames2 = [];
  const isPropertyNames = exports_guard.EveryAll(exports_guard.Keys(value2), 0, (key, _index) => {
    const nextInstancePath = `${instancePath}/${key}`;
    const nextSchemaPath = `${schemaPath}/propertyNames`;
    const nextContext = new AccumulatedErrorContext;
    const isPropertyName = ErrorSchema(stack, nextContext, nextSchemaPath, nextInstancePath, schema4.propertyNames, key);
    if (!isPropertyName)
      propertyNames2.push(key);
    return isPropertyName;
  });
  return isPropertyNames || context.AddError({
    keyword: "propertyNames",
    schemaPath,
    instancePath,
    params: { propertyNames: propertyNames2 }
  });
}

// node_modules/typebox/build/schema/engine/recursiveRef.mjs
function CheckRecursiveRef(stack, context, schema4, value2) {
  const target = stack.RecursiveRef(schema4) ?? false;
  return IsSchema3(target) && CheckSchema(stack, context, target, value2);
}
function ErrorRecursiveRef(stack, context, _schemaPath, instancePath, schema4, value2) {
  const target = stack.RecursiveRef(schema4) ?? false;
  return IsSchema3(target) && ErrorSchema(stack, context, "#", instancePath, target, value2);
}

// node_modules/typebox/build/schema/engine/ref.mjs
function CheckRef(stack, context, schema4, value2) {
  const target = stack.Ref(schema4) ?? false;
  const nextContext = new CheckContext;
  const result = IsSchema3(target) && CheckSchema(stack, nextContext, target, value2);
  if (result)
    context.Merge([nextContext]);
  return result;
}
function ErrorRef(stack, context, _schemaPath, instancePath, schema4, value2) {
  const target = stack.Ref(schema4) ?? false;
  const nextContext = new AccumulatedErrorContext;
  const result = IsSchema3(target) && ErrorSchema(stack, nextContext, "#", instancePath, target, value2);
  if (result)
    context.Merge([nextContext]);
  if (!result)
    nextContext.GetErrors().forEach((error3) => context.AddError(error3));
  return result;
}

// node_modules/typebox/build/schema/engine/required.mjs
function CheckRequired(_stack, _context, schema4, value2) {
  return exports_guard.Every(schema4.required, 0, (key) => exports_guard.HasPropertyKey(value2, key));
}
function ErrorRequired(_stack, context, schemaPath, instancePath, schema4, value2) {
  const requiredProperties = [];
  const isRequired = exports_guard.EveryAll(schema4.required, 0, (key) => {
    const hasKey = exports_guard.HasPropertyKey(value2, key);
    if (!hasKey)
      requiredProperties.push(key);
    return hasKey;
  });
  return isRequired || context.AddError({
    keyword: "required",
    schemaPath,
    instancePath,
    params: { requiredProperties }
  });
}

// node_modules/typebox/build/schema/engine/type.mjs
function CheckTypeName(_stack, _context, type5, _schema, value2) {
  return exports_guard.IsEqual(type5, "object") ? exports_guard.IsObjectNotArray(value2) : exports_guard.IsEqual(type5, "array") ? exports_guard.IsArray(value2) : exports_guard.IsEqual(type5, "boolean") ? exports_guard.IsBoolean(value2) : exports_guard.IsEqual(type5, "integer") ? exports_guard.IsInteger(value2) : exports_guard.IsEqual(type5, "number") ? exports_guard.IsNumber(value2) : exports_guard.IsEqual(type5, "null") ? exports_guard.IsNull(value2) : exports_guard.IsEqual(type5, "string") ? exports_guard.IsString(value2) : exports_guard.IsEqual(type5, "bigint") ? exports_guard.IsBigInt(value2) : exports_guard.IsEqual(type5, "constructor") ? exports_guard.IsConstructor(value2) : exports_guard.IsEqual(type5, "function") ? exports_guard.IsFunction(value2) : exports_guard.IsEqual(type5, "symbol") ? exports_guard.IsSymbol(value2) : exports_guard.IsEqual(type5, "undefined") ? exports_guard.IsUndefined(value2) : exports_guard.IsEqual(type5, "void") ? exports_guard.IsUndefined(value2) : true;
}
function CheckTypeNames(stack, context, types, schema4, value2) {
  return types.some((type5) => CheckTypeName(stack, context, type5, schema4, value2));
}
function CheckType(stack, context, schema4, value2) {
  return exports_guard.IsArray(schema4.type) ? CheckTypeNames(stack, context, schema4.type, schema4, value2) : CheckTypeName(stack, context, schema4.type, schema4, value2);
}
function ErrorType(stack, context, schemaPath, instancePath, schema4, value2) {
  const isType = exports_guard.IsArray(schema4.type) ? CheckTypeNames(stack, context, schema4.type, schema4, value2) : CheckTypeName(stack, context, schema4.type, schema4, value2);
  return isType || context.AddError({
    keyword: "type",
    schemaPath,
    instancePath,
    params: { type: schema4.type }
  });
}

// node_modules/typebox/build/schema/engine/unevaluatedItems.mjs
function CheckUnevaluatedItems(stack, context, schema4, value2) {
  const indices = context.GetIndices();
  return exports_guard.Every(value2, 0, (item, index) => {
    return (indices.has(index) || CheckSchema(stack, context, schema4.unevaluatedItems, item)) && context.AddIndex(index);
  });
}
function ErrorUnevaluatedItems(stack, context, schemaPath, instancePath, schema4, value2) {
  const indices = context.GetIndices();
  const unevaluatedItems2 = [];
  const isUnevaluatedItems = exports_guard.EveryAll(value2, 0, (item, index) => {
    const nextContext = new AccumulatedErrorContext;
    const isEvaluatedItem = (indices.has(index) || ErrorSchema(stack, nextContext, schemaPath, instancePath, schema4.unevaluatedItems, item)) && context.AddIndex(index);
    if (!isEvaluatedItem)
      unevaluatedItems2.push(index);
    return isEvaluatedItem;
  });
  return isUnevaluatedItems || context.AddError({
    keyword: "unevaluatedItems",
    schemaPath,
    instancePath,
    params: { unevaluatedItems: unevaluatedItems2 }
  });
}

// node_modules/typebox/build/schema/engine/unevaluatedProperties.mjs
function CheckUnevaluatedProperties(stack, context, schema4, value2) {
  const keys = context.GetKeys();
  return exports_guard.Every(exports_guard.Entries(value2), 0, ([key, prop]) => {
    return keys.has(key) || CheckSchema(stack, context, schema4.unevaluatedProperties, prop) && context.AddKey(key);
  });
}
function ErrorUnevaluatedProperties(stack, context, schemaPath, instancePath, schema4, value2) {
  const keys = context.GetKeys();
  const unevaluatedProperties2 = [];
  const isUnevaluatedProperties = exports_guard.EveryAll(exports_guard.Entries(value2), 0, ([key, prop]) => {
    const nextContext = new AccumulatedErrorContext;
    const isEvaluatedProperty = keys.has(key) || ErrorSchema(stack, nextContext, schemaPath, instancePath, schema4.unevaluatedProperties, prop) && context.AddKey(key);
    if (!isEvaluatedProperty)
      unevaluatedProperties2.push(key);
    return isEvaluatedProperty;
  });
  return isUnevaluatedProperties || context.AddError({
    keyword: "unevaluatedProperties",
    schemaPath,
    instancePath,
    params: { unevaluatedProperties: unevaluatedProperties2 }
  });
}

// node_modules/typebox/build/schema/engine/uniqueItems.mjs
function IsValid5(schema4) {
  return !exports_guard.IsEqual(schema4.uniqueItems, false);
}
function CheckUniqueItems(_stack, _context, schema4, value2) {
  if (!IsValid5(schema4))
    return true;
  const set2 = new Set(value2.map(exports_hash.Hash)).size;
  const isLength = value2.length;
  return exports_guard.IsEqual(set2, isLength);
}
function ErrorUniqueItems(_stack, context, schemaPath, instancePath, schema4, value2) {
  if (!IsValid5(schema4))
    return true;
  const set2 = new Set;
  const duplicateItems = value2.reduce((result, value3, index) => {
    const hash = exports_hash.Hash(value3);
    if (set2.has(hash))
      return [...result, index];
    set2.add(hash);
    return result;
  }, []);
  const isUniqueItems = exports_guard.IsEqual(duplicateItems.length, 0);
  return isUniqueItems || context.AddError({
    keyword: "uniqueItems",
    schemaPath,
    instancePath,
    params: { duplicateItems }
  });
}

// node_modules/typebox/build/schema/engine/schema.mjs
function CheckSchemaPushStack(stack, context, schema4, value2) {
  return context.Push() && CheckSchema(stack, context, schema4, value2) && context.Pop();
}
function CheckSchema(stack, context, schema4, value2) {
  stack.Push(schema4);
  const result = IsSchemaBoolean(schema4) ? CheckSchemaBoolean(stack, context, schema4, value2) : (!IsType(schema4) || CheckType(stack, context, schema4, value2)) && (!(exports_guard.IsObject(value2) && !exports_guard.IsArray(value2)) || (!IsRequired(schema4) || CheckRequired(stack, context, schema4, value2)) && (!IsAdditionalProperties2(schema4) || CheckAdditionalProperties(stack, context, schema4, value2)) && (!IsDependencies(schema4) || CheckDependencies(stack, context, schema4, value2)) && (!IsDependentRequired(schema4) || CheckDependentRequired(stack, context, schema4, value2)) && (!IsDependentSchemas(schema4) || CheckDependentSchemas(stack, context, schema4, value2)) && (!IsPatternProperties(schema4) || CheckPatternProperties(stack, context, schema4, value2)) && (!IsProperties2(schema4) || CheckProperties(stack, context, schema4, value2)) && (!IsPropertyNames(schema4) || CheckPropertyNames(stack, context, schema4, value2)) && (!IsMinProperties(schema4) || CheckMinProperties(stack, context, schema4, value2)) && (!IsMaxProperties(schema4) || CheckMaxProperties(stack, context, schema4, value2))) && (!exports_guard.IsArray(value2) || (!IsAdditionalItems(schema4) || CheckAdditionalItems(stack, context, schema4, value2)) && (!IsContains(schema4) || CheckContains(stack, context, schema4, value2)) && (!IsItems(schema4) || CheckItems(stack, context, schema4, value2)) && (!IsMaxContains(schema4) || CheckMaxContains(stack, context, schema4, value2)) && (!IsMaxItems(schema4) || CheckMaxItems(stack, context, schema4, value2)) && (!IsMinContains(schema4) || CheckMinContains(stack, context, schema4, value2)) && (!IsMinItems(schema4) || CheckMinItems(stack, context, schema4, value2)) && (!IsPrefixItems(schema4) || CheckPrefixItems(stack, context, schema4, value2)) && (!IsUniqueItems(schema4) || CheckUniqueItems(stack, context, schema4, value2))) && (!exports_guard.IsString(value2) || (!IsMaxLength3(schema4) || CheckMaxLength(stack, context, schema4, value2)) && (!IsMinLength3(schema4) || CheckMinLength(stack, context, schema4, value2)) && (!IsFormat(schema4) || CheckFormat(stack, context, schema4, value2)) && (!IsPattern2(schema4) || CheckPattern(stack, context, schema4, value2))) && (!(exports_guard.IsNumber(value2) || exports_guard.IsBigInt(value2)) || (!IsExclusiveMaximum(schema4) || CheckExclusiveMaximum(stack, context, schema4, value2)) && (!IsExclusiveMinimum(schema4) || CheckExclusiveMinimum(stack, context, schema4, value2)) && (!IsMaximum(schema4) || CheckMaximum(stack, context, schema4, value2)) && (!IsMinimum(schema4) || CheckMinimum(stack, context, schema4, value2)) && (!IsMultipleOf2(schema4) || CheckMultipleOf(stack, context, schema4, value2))) && (!IsRef3(schema4) || CheckRef(stack, context, schema4, value2)) && (!IsRecursiveRef(schema4) || CheckRecursiveRef(stack, context, schema4, value2)) && (!IsDynamicRef(schema4) || CheckDynamicRef(stack, context, schema4, value2)) && (!IsConst(schema4) || CheckConst(stack, context, schema4, value2)) && (!IsEnum(schema4) || CheckEnum(stack, context, schema4, value2)) && (!IsIf(schema4) || CheckIf(stack, context, schema4, value2)) && (!IsNot3(schema4) || CheckNot(stack, context, schema4, value2)) && (!IsAllOf(schema4) || CheckAllOf(stack, context, schema4, value2)) && (!IsAnyOf(schema4) || CheckAnyOf(stack, context, schema4, value2)) && (!IsOneOf(schema4) || CheckOneOf(stack, context, schema4, value2)) && (!IsUnevaluatedItems(schema4) || (!exports_guard.IsArray(value2) || CheckUnevaluatedItems(stack, context, schema4, value2))) && (!IsUnevaluatedProperties(schema4) || (!exports_guard.IsObject(value2) || CheckUnevaluatedProperties(stack, context, schema4, value2))) && (!IsRefine(schema4) || CheckRefine(stack, context, schema4, value2));
  stack.Pop(schema4);
  return result;
}
function ErrorSchemaPushStack(stack, context, schemaPath, instancePath, schema4, value2) {
  return context.Push() && ErrorSchema(stack, context, schemaPath, instancePath, schema4, value2) && context.Pop();
}
function ErrorSchema(stack, context, schemaPath, instancePath, schema4, value2) {
  stack.Push(schema4);
  const result = IsSchemaBoolean(schema4) ? ErrorSchemaBoolean(stack, context, schemaPath, instancePath, schema4, value2) : !!(+(!IsType(schema4) || ErrorType(stack, context, schemaPath, instancePath, schema4, value2)) & +(!(exports_guard.IsObject(value2) && !exports_guard.IsArray(value2)) || !!(+(!IsRequired(schema4) || ErrorRequired(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsAdditionalProperties2(schema4) || ErrorAdditionalProperties(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsDependencies(schema4) || ErrorDependencies(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsDependentRequired(schema4) || ErrorDependentRequired(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsDependentSchemas(schema4) || ErrorDependentSchemas(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsPatternProperties(schema4) || ErrorPatternProperties(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsProperties2(schema4) || ErrorProperties(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsPropertyNames(schema4) || ErrorPropertyNames(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsMinProperties(schema4) || ErrorMinProperties(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsMaxProperties(schema4) || ErrorMaxProperties(stack, context, schemaPath, instancePath, schema4, value2)))) & +(!exports_guard.IsArray(value2) || !!(+(!IsAdditionalItems(schema4) || ErrorAdditionalItems(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsContains(schema4) || ErrorContains(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsItems(schema4) || ErrorItems(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsMaxContains(schema4) || ErrorMaxContains(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsMaxItems(schema4) || ErrorMaxItems(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsMinContains(schema4) || ErrorMinContains(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsMinItems(schema4) || ErrorMinItems(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsPrefixItems(schema4) || ErrorPrefixItems(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsUniqueItems(schema4) || ErrorUniqueItems(stack, context, schemaPath, instancePath, schema4, value2)))) & +(!exports_guard.IsString(value2) || !!(+(!IsMaxLength3(schema4) || ErrorMaxLength(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsMinLength3(schema4) || ErrorMinLength(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsFormat(schema4) || ErrorFormat(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsPattern2(schema4) || ErrorPattern(stack, context, schemaPath, instancePath, schema4, value2)))) & +(!(exports_guard.IsNumber(value2) || exports_guard.IsBigInt(value2)) || !!(+(!IsExclusiveMaximum(schema4) || ErrorExclusiveMaximum(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsExclusiveMinimum(schema4) || ErrorExclusiveMinimum(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsMaximum(schema4) || ErrorMaximum(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsMinimum(schema4) || ErrorMinimum(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsMultipleOf2(schema4) || ErrorMultipleOf(stack, context, schemaPath, instancePath, schema4, value2)))) & +(!IsRef3(schema4) || ErrorRef(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsRecursiveRef(schema4) || ErrorRecursiveRef(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsDynamicRef(schema4) || ErrorDynamicRef(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsConst(schema4) || ErrorConst(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsEnum(schema4) || ErrorEnum(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsIf(schema4) || ErrorIf(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsNot3(schema4) || ErrorNot(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsAllOf(schema4) || ErrorAllOf(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsAnyOf(schema4) || ErrorAnyOf(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsOneOf(schema4) || ErrorOneOf(stack, context, schemaPath, instancePath, schema4, value2)) & +(!IsUnevaluatedItems(schema4) || (!exports_guard.IsArray(value2) || ErrorUnevaluatedItems(stack, context, schemaPath, instancePath, schema4, value2))) & +(!IsUnevaluatedProperties(schema4) || (!exports_guard.IsObject(value2) || ErrorUnevaluatedProperties(stack, context, schemaPath, instancePath, schema4, value2)))) && (!IsRefine(schema4) || ErrorRefine(stack, context, schemaPath, instancePath, schema4, value2));
  stack.Pop(schema4);
  return result;
}

// node_modules/typebox/build/schema/engine/_functions.mjs
var names = new Map;
var funcs = new Map;
// node_modules/typebox/build/schema/resolve/resolve.mjs
var exports_resolve = {};
__export(exports_resolve, {
  Ref: () => Ref2,
  DynamicRef: () => DynamicRef
});
// node_modules/typebox/build/schema/pointer/pointer.mjs
var exports_pointer = {};
__export(exports_pointer, {
  Set: () => Set4,
  Indices: () => Indices,
  Has: () => Has2,
  Get: () => Get3,
  Delete: () => Delete
});
function AssertNotRoot(indices) {
  if (indices.length === 0)
    throw Error("Cannot set root");
}
function AssertCanSet(value2) {
  if (!exports_guard.IsObject(value2))
    throw Error("Cannot set value");
}
function AssertIndex(index) {
  if (exports_guard.IsUnsafePropertyKey(index))
    throw Error("Pointer contains unsafe property key");
}
function AssertIndices(indices) {
  for (const index of indices)
    AssertIndex(index);
}
function IsNumericIndex(index) {
  return /^(0|[1-9]\d*)$/.test(index);
}
function TakeIndexRight(indices) {
  return [
    indices.slice(0, indices.length - 1),
    indices.slice(indices.length - 1)[0]
  ];
}
function HasIndex(index, value2) {
  return exports_guard.IsObject(value2) && exports_guard.HasPropertyKey(value2, index);
}
function GetIndex(index, value2) {
  return exports_guard.IsObject(value2) && !exports_guard.IsUnsafePropertyKey(index) ? value2[index] : undefined;
}
function GetIndices(indices, value2) {
  return indices.reduce((value3, index) => GetIndex(index, value3), value2);
}
function Indices(pointer) {
  if (exports_guard.IsEqual(pointer.length, 0))
    return [];
  const indices = pointer.split("/").map((index) => index.replace(/~1/g, "/").replace(/~0/g, "~"));
  return indices.length > 0 && indices[0] === "" ? indices.slice(1) : indices;
}
function Has2(value2, pointer) {
  let current = value2;
  return Indices(pointer).every((index) => {
    if (!HasIndex(index, current))
      return false;
    current = current[index];
    return true;
  });
}
function Get3(value2, pointer) {
  const indices = Indices(pointer);
  return GetIndices(indices, value2);
}
function Set4(value2, pointer, next) {
  const indices = Indices(pointer);
  AssertNotRoot(indices);
  AssertIndices(indices);
  const [head, index] = TakeIndexRight(indices);
  const parent = GetIndices(head, value2);
  AssertCanSet(parent);
  parent[index] = next;
  return value2;
}
function Delete(value2, pointer) {
  const indices = Indices(pointer);
  AssertNotRoot(indices);
  AssertIndices(indices);
  const [head, index] = TakeIndexRight(indices);
  const parent = GetIndices(head, value2);
  AssertCanSet(parent);
  if (exports_guard.IsArray(parent) && IsNumericIndex(index)) {
    parent.splice(+index, 1);
  } else {
    delete parent[index];
  }
  return value2;
}
// node_modules/typebox/build/schema/resolve/ref.mjs
function MatchId(schema4, base, ref4) {
  if (schema4.$id === ref4.hash)
    return schema4;
  const absoluteId = new URL(schema4.$id, base.href);
  const absoluteRef = new URL(ref4.href, base.href);
  if (exports_guard.IsEqual(absoluteId.pathname, absoluteRef.pathname)) {
    return ref4.hash.startsWith("#") ? MatchHash(schema4, base, ref4) : schema4;
  }
  return;
}
function MatchAnchor(schema4, base, ref4) {
  const absoluteAnchor = new URL(`#${schema4.$anchor}`, base.href);
  const absoluteRef = new URL(ref4.href, base.href);
  return exports_guard.IsEqual(absoluteAnchor.href, absoluteRef.href) ? schema4 : undefined;
}
function MatchDynamicAnchor(schema4, base, ref4) {
  const absoluteAnchor = new URL(`#${schema4.$dynamicAnchor}`, base.href);
  const absoluteRef = new URL(ref4.href, base.href);
  return exports_guard.IsEqual(absoluteAnchor.href, absoluteRef.href) ? schema4 : undefined;
}
function MatchHash(schema4, _base, ref4) {
  if (ref4.href.endsWith("#"))
    return schema4;
  if (!ref4.hash.startsWith("#"))
    return;
  const fragment = decodeURIComponent(ref4.hash.slice(1));
  if (!fragment.startsWith("/"))
    return;
  return exports_pointer.Get(schema4, fragment);
}
function Match2(schema4, base, ref4) {
  if (IsId(schema4)) {
    const result = MatchId(schema4, base, ref4);
    if (!exports_guard.IsUndefined(result))
      return result;
  }
  if (IsAnchor(schema4)) {
    const result = MatchAnchor(schema4, base, ref4);
    if (!exports_guard.IsUndefined(result))
      return result;
  }
  if (IsDynamicAnchor(schema4)) {
    const result = MatchDynamicAnchor(schema4, base, ref4);
    if (!exports_guard.IsUndefined(result))
      return result;
  }
  return MatchHash(schema4, base, ref4);
}
function FromArray8(schema4, base, ref4) {
  return schema4.reduce((result, item) => {
    const match = FromValue3(item, base, ref4);
    return !exports_guard.IsUndefined(match) ? match : result;
  }, undefined);
}
function FromObject9(schema4, base, ref4) {
  return exports_guard.Keys(schema4).reduce((result, key) => {
    const match = FromValue3(schema4[key], base, ref4);
    return !exports_guard.IsUndefined(match) ? match : result;
  }, undefined);
}
function FromValue3(schema4, base, ref4) {
  const nextBase = IsSchemaObject(schema4) && IsId(schema4) ? new URL(schema4.$id, base.href) : base;
  if (IsSchemaObject(schema4)) {
    const result = Match2(schema4, nextBase, ref4);
    if (!exports_guard.IsUndefined(result))
      return result;
  }
  if (exports_guard.IsArray(schema4))
    return FromArray8(schema4, nextBase, ref4);
  if (exports_guard.IsObject(schema4))
    return FromObject9(schema4, nextBase, ref4);
  return;
}
function Ref2(schema4, ref4) {
  const defaultBase = new URL("http://unknown/");
  const initialBase = IsId(schema4) ? new URL(schema4.$id, defaultBase.href) : defaultBase;
  const initialRef = new URL(ref4, initialBase.href);
  return FromValue3(schema4, initialBase, initialRef);
}
function DynamicRef(root, base, dynamicRef2, dynamicAnchors) {
  const fragmentTarget = dynamicRef2.$dynamicRef.startsWith("#") ? Ref2(base, dynamicRef2.$dynamicRef) : Ref2(root, dynamicRef2.$dynamicRef);
  if (exports_guard.IsUndefined(fragmentTarget))
    return;
  if (!IsSchemaObject(fragmentTarget) || !IsDynamicAnchor(fragmentTarget))
    return fragmentTarget;
  const fragment = new URL(dynamicRef2.$dynamicRef, "http://unknown/").hash;
  if (fragment.startsWith("#/"))
    return fragmentTarget;
  const anchorTarget = dynamicAnchors.find((anchor2) => anchor2.$dynamicAnchor === fragmentTarget.$dynamicAnchor);
  return anchorTarget ?? fragmentTarget;
}
// node_modules/typebox/build/schema/engine/_stack.mjs
var __classPrivateFieldGet = function(receiver, state, kind, f2) {
  if (kind === "a" && !f2)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _Stack_instances;
var _Stack_PushResourceAnchors;
var _Stack_PopResourceAnchors;
var _Stack_FromContext;
var _Stack_FromRef;

class Stack {
  constructor(context, schema4) {
    _Stack_instances.add(this);
    this.context = context;
    this.schema = schema4;
    this.ids = [];
    this.anchors = [];
    this.recursiveAnchors = [];
    this.dynamicAnchors = [];
  }
  BaseURL() {
    return this.ids.reduce((result, schema4) => new URL(schema4.$id, result), new URL("http://unknown"));
  }
  Base() {
    return this.ids[this.ids.length - 1] ?? this.schema;
  }
  Push(schema4) {
    if (!IsSchemaObject(schema4))
      return;
    if (IsId(schema4)) {
      this.ids.push(schema4);
      __classPrivateFieldGet(this, _Stack_instances, "m", _Stack_PushResourceAnchors).call(this, schema4);
    }
    if (IsAnchor(schema4))
      this.anchors.push(schema4);
    if (IsRecursiveAnchorTrue(schema4))
      this.recursiveAnchors.push(schema4);
    if (IsDynamicAnchor(schema4))
      this.dynamicAnchors.push(schema4);
  }
  Pop(schema4) {
    if (!IsSchemaObject(schema4))
      return;
    if (IsId(schema4)) {
      this.ids.pop();
      __classPrivateFieldGet(this, _Stack_instances, "m", _Stack_PopResourceAnchors).call(this, schema4);
    }
    if (IsAnchor(schema4))
      this.anchors.pop();
    if (IsRecursiveAnchorTrue(schema4))
      this.recursiveAnchors.pop();
    if (IsDynamicAnchor(schema4))
      this.dynamicAnchors.pop();
  }
  Ref(ref5) {
    return __classPrivateFieldGet(this, _Stack_instances, "m", _Stack_FromContext).call(this, ref5) ?? __classPrivateFieldGet(this, _Stack_instances, "m", _Stack_FromRef).call(this, ref5);
  }
  RecursiveRef(recursiveRef2) {
    return IsRecursiveAnchorTrue(this.Base()) ? exports_resolve.Ref(this.recursiveAnchors[0], recursiveRef2.$recursiveRef) : exports_resolve.Ref(this.Base(), recursiveRef2.$recursiveRef);
  }
  DynamicRef(dynamicRef2) {
    const root = this.schema;
    return exports_resolve.DynamicRef(root, this.Base(), dynamicRef2, this.dynamicAnchors);
  }
}
_Stack_instances = new WeakSet, _Stack_PushResourceAnchors = function _Stack_PushResourceAnchors2(schema4, isRoot = true) {
  if (!IsSchemaObject(schema4))
    return;
  const current = schema4;
  if (!isRoot && IsId(current))
    return;
  if (!isRoot && IsDynamicAnchor(current))
    this.dynamicAnchors.push(current);
  for (const key of exports_guard.Keys(current))
    __classPrivateFieldGet(this, _Stack_instances, "m", _Stack_PushResourceAnchors2).call(this, current[key], false);
}, _Stack_PopResourceAnchors = function _Stack_PopResourceAnchors2(schema4, isRoot = true) {
  if (!IsSchemaObject(schema4))
    return;
  const current = schema4;
  if (!isRoot && IsId(current))
    return;
  if (!isRoot && IsDynamicAnchor(current))
    this.dynamicAnchors.pop();
  for (const key of exports_guard.Keys(current))
    __classPrivateFieldGet(this, _Stack_instances, "m", _Stack_PopResourceAnchors2).call(this, current[key], false);
}, _Stack_FromContext = function _Stack_FromContext2(ref5) {
  return exports_guard.HasPropertyKey(this.context, ref5.$ref) ? this.context[ref5.$ref] : undefined;
}, _Stack_FromRef = function _Stack_FromRef2(ref5) {
  const root = this.schema;
  return !ref5.$ref.startsWith("#") ? exports_resolve.Ref(root, ref5.$ref) : exports_resolve.Ref(this.Base(), ref5.$ref);
};
// node_modules/typebox/build/system/locale/en_US.mjs
function en_US(error3) {
  switch (error3.keyword) {
    case "additionalProperties":
      return "must not have additional properties";
    case "anyOf":
      return "must match a schema in anyOf";
    case "boolean":
      return "schema is false";
    case "const":
      return "must be equal to constant";
    case "contains":
      return "must contain at least 1 valid item";
    case "dependencies":
      return `must have properties ${error3.params.dependencies.join(", ")} when property ${error3.params.property} is present`;
    case "dependentRequired":
      return `must have properties ${error3.params.dependencies.join(", ")} when property ${error3.params.property} is present`;
    case "enum":
      return "must be equal to one of the allowed values";
    case "exclusiveMaximum":
      return `must be ${error3.params.comparison} ${error3.params.limit}`;
    case "exclusiveMinimum":
      return `must be ${error3.params.comparison} ${error3.params.limit}`;
    case "format":
      return `must match format "${error3.params.format}"`;
    case "if":
      return `must match "${error3.params.failingKeyword}" schema`;
    case "maxItems":
      return `must not have more than ${error3.params.limit} items`;
    case "maxLength":
      return `must not have more than ${error3.params.limit} characters`;
    case "maxProperties":
      return `must not have more than ${error3.params.limit} properties`;
    case "maximum":
      return `must be ${error3.params.comparison} ${error3.params.limit}`;
    case "minItems":
      return `must not have fewer than ${error3.params.limit} items`;
    case "minLength":
      return `must not have fewer than ${error3.params.limit} characters`;
    case "minProperties":
      return `must not have fewer than ${error3.params.limit} properties`;
    case "minimum":
      return `must be ${error3.params.comparison} ${error3.params.limit}`;
    case "multipleOf":
      return `must be multiple of ${error3.params.multipleOf}`;
    case "not":
      return "must not be valid";
    case "oneOf":
      return "must match exactly one schema in oneOf";
    case "pattern":
      return `must match pattern "${error3.params.pattern}"`;
    case "propertyNames":
      return `property names ${error3.params.propertyNames.join(", ")} are invalid`;
    case "required":
      return `must have required properties ${error3.params.requiredProperties.join(", ")}`;
    case "type":
      return typeof error3.params.type === "string" ? `must be ${error3.params.type}` : `must be either ${error3.params.type.join(" or ")}`;
    case "unevaluatedItems":
      return "must not have unevaluated items";
    case "unevaluatedProperties":
      return "must not have unevaluated properties";
    case "uniqueItems":
      return `must not have duplicate items`;
    case "~refine":
      return error3.params.message;
    default:
      return "an unknown validation error occurred";
  }
}

// node_modules/typebox/build/system/locale/_config.mjs
var locale = en_US;
function Get4() {
  return locale;
}

// node_modules/typebox/build/schema/errors.mjs
function Errors(...args) {
  const [context, schema5, value2] = exports_arguments.Match(args, {
    3: (context2, schema6, value3) => [context2, schema6, value3],
    2: (schema6, value3) => [{}, schema6, value3]
  });
  const settings2 = exports_settings.Get();
  const locale2 = Get4();
  const errors = [];
  const stack = new Stack(context, schema5);
  const errorContext = new ErrorContext((error3) => {
    if (exports_guard.IsGreaterEqualThan(errors.length, settings2.maxErrors))
      return;
    return errors.push({ ...error3, message: locale2(error3) });
  });
  const result = ErrorSchema(stack, errorContext, "#", "", schema5, value2);
  return [result, errors];
}

// node_modules/typebox/build/schema/check.mjs
function Check(...args) {
  const [context, schema5, value2] = exports_arguments.Match(args, {
    3: (context2, schema6, value3) => [context2, schema6, value3],
    2: (schema6, value3) => [{}, schema6, value3]
  });
  const stack = new Stack(context, schema5);
  const checkContext = new CheckContext;
  return CheckSchema(stack, checkContext, schema5, value2);
}
// node_modules/typebox/build/value/check/check.mjs
function Check2(...args) {
  const [context, type6, value2] = exports_arguments.Match(args, {
    3: (context2, type7, value3) => [context2, type7, value3],
    2: (type7, value3) => [{}, type7, value3]
  });
  return Check(context, type6, value2);
}
// node_modules/typebox/build/value/errors/errors.mjs
function Errors2(...args) {
  const [context, type6, value2] = exports_arguments.Match(args, {
    3: (context2, type7, value3) => [context2, type7, value3],
    2: (type7, value3) => [{}, type7, value3]
  });
  const [_2, errors2] = Errors(context, type6, value2);
  return errors2;
}
// node_modules/typebox/build/value/assert/assert.mjs
class AssertError extends Error {
  constructor(source, value2, errors3) {
    super(source);
    Object.defineProperty(this, "cause", {
      value: { source, errors: errors3, value: value2 },
      writable: false,
      configurable: false,
      enumerable: false
    });
  }
}
// node_modules/typebox/build/system/memory/memory.mjs
var exports_memory = {};
__export(exports_memory, {
  Update: () => Update,
  Metrics: () => Metrics,
  Discard: () => Discard2,
  Create: () => Create,
  Clone: () => Clone2,
  Assign: () => Assign
});

// node_modules/typebox/build/system/memory/metrics.mjs
var Metrics = {
  assign: 0,
  create: 0,
  clone: 0,
  discard: 0,
  update: 0
};

// node_modules/typebox/build/system/memory/assign.mjs
function Assign(left, right) {
  Metrics.assign += 1;
  return { ...left, ...right };
}
// node_modules/typebox/build/system/memory/clone.mjs
function FromClassInstance(value2) {
  return value2;
}
function IsTypeObject(value2) {
  return exports_guard.HasPropertyKey(value2, "~kind") || exports_guard.HasPropertyKey(value2, "~unsafe");
}
function FromTypeObject(value2) {
  const result = {};
  const descriptors = Object.getOwnPropertyDescriptors(value2);
  for (const key of Object.keys(descriptors)) {
    if (exports_guard.IsUnsafePropertyKey(key))
      continue;
    const descriptor = descriptors[key];
    if (exports_guard.HasPropertyKey(descriptor, "value")) {
      Object.defineProperty(result, key, { ...descriptor, value: FromValue4(descriptor.value) });
    }
  }
  return result;
}
function FromPlainObject(value2) {
  const result = {};
  for (const key of exports_guard.Keys(value2)) {
    if (exports_guard.IsUnsafePropertyKey(key))
      continue;
    result[key] = FromValue4(value2[key]);
  }
  for (const key of exports_guard.Symbols(value2)) {
    result[key] = FromValue4(value2[key]);
  }
  return result;
}
function FromObject10(value2) {
  return exports_guard.IsClassInstance(value2) ? FromClassInstance(value2) : IsTypeObject(value2) ? FromTypeObject(value2) : FromPlainObject(value2);
}
function FromArray9(value2) {
  return value2.map((element) => FromValue4(element));
}
function FromTypedArray(value2) {
  return value2.slice();
}
function FromRegExp3(value2) {
  return new RegExp(value2.source, value2.flags);
}
function FromMap(value2) {
  return new Map(FromValue4([...value2.entries()]));
}
function FromSet(value2) {
  return new Set(FromValue4([...value2.values()]));
}
function FromValue4(value2) {
  return exports_globals.IsTypeArray(value2) ? FromTypedArray(value2) : exports_globals.IsRegExp(value2) ? FromRegExp3(value2) : exports_globals.IsMap(value2) ? FromMap(value2) : exports_globals.IsSet(value2) ? FromSet(value2) : exports_guard.IsArray(value2) ? FromArray9(value2) : exports_guard.IsObject(value2) ? FromObject10(value2) : value2;
}
function Clone2(value2) {
  Metrics.clone += 1;
  return FromValue4(value2);
}
// node_modules/typebox/build/system/memory/create.mjs
function MergeHidden(left, right) {
  for (const key of Object.keys(right)) {
    Object.defineProperty(left, key, {
      configurable: true,
      writable: true,
      enumerable: false,
      value: right[key]
    });
  }
  return left;
}
function Merge(left, right) {
  return { ...left, ...right };
}
function Create(hidden, enumerable, options = {}) {
  Metrics.create += 1;
  const settings2 = exports_settings.Get();
  const withOptions = Merge(enumerable, options);
  const withHidden = settings2.enumerableKind ? Merge(withOptions, hidden) : MergeHidden(withOptions, hidden);
  return settings2.immutableTypes ? Object.freeze(withHidden) : withHidden;
}
// node_modules/typebox/build/system/memory/discard.mjs
function Discard2(value2, propertyKeys) {
  Metrics.discard += 1;
  const result = {};
  const descriptors = Object.getOwnPropertyDescriptors(Clone2(value2));
  const keysToDiscard = new Set(propertyKeys);
  for (const key of Object.keys(descriptors)) {
    if (keysToDiscard.has(key))
      continue;
    Object.defineProperty(result, key, descriptors[key]);
  }
  return result;
}
// node_modules/typebox/build/system/memory/update.mjs
function Update(current, hidden, enumerable) {
  Metrics.update += 1;
  const settings2 = exports_settings.Get();
  const result = Clone2(current);
  for (const key of Object.keys(hidden)) {
    Object.defineProperty(result, key, {
      configurable: true,
      writable: true,
      enumerable: settings2.enumerableKind,
      value: hidden[key]
    });
  }
  for (const key of Object.keys(enumerable)) {
    Object.defineProperty(result, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: enumerable[key]
    });
  }
  return result;
}
// node_modules/typebox/build/type/types/schema.mjs
function IsKind3(value2, kind) {
  return exports_guard.IsObject(value2) && exports_guard.HasPropertyKey(value2, "~kind") && exports_guard.IsEqual(value2["~kind"], kind);
}
function IsSchema4(value2) {
  return exports_guard.IsObject(value2);
}

// node_modules/typebox/build/type/types/deferred.mjs
function Deferred(action, parameters3, options) {
  return exports_memory.Create({ "~kind": "Deferred" }, { type: "deferred", action, parameters: parameters3, options }, {});
}
function IsDeferred(value2) {
  return IsKind3(value2, "Deferred");
}

// node_modules/typebox/build/type/engine/readonly/instantiate_add.mjs
function AddReadonlyOperation(type6) {
  return exports_memory.Update(type6, { "~readonly": true }, {});
}
function AddReadonlyAction(type6, options) {
  const result = exports_memory.Update(AddReadonlyOperation(type6), {}, options);
  return result;
}
function AddReadonlyInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return AddReadonlyAction(instantiatedType, options);
}

// node_modules/typebox/build/type/engine/optional/instantiate_add.mjs
function AddOptionalOperation(type6) {
  return exports_memory.Update(type6, { "~optional": true }, {});
}
function AddOptionalAction(type6, options) {
  const result = exports_memory.Update(AddOptionalOperation(type6), {}, options);
  return result;
}
function AddOptionalInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return AddOptionalAction(instantiatedType, options);
}

// node_modules/typebox/build/type/types/array.mjs
function _Array_(items3, options) {
  return exports_memory.Create({ "~kind": "Array" }, { type: "array", items: items3 }, options);
}
function IsArray6(value2) {
  return IsKind3(value2, "Array");
}
function ArrayOptions(type6) {
  return exports_memory.Discard(type6, ["~kind", "type", "items"]);
}

// node_modules/typebox/build/type/types/constructor.mjs
function Constructor2(parameters3, instanceType, options = {}) {
  return exports_memory.Create({ "~kind": "Constructor" }, { type: "constructor", parameters: parameters3, instanceType }, options);
}
function IsConstructor4(value2) {
  return IsKind3(value2, "Constructor");
}
function ConstructorOptions(type6) {
  return exports_memory.Discard(type6, ["~kind", "type", "parameters", "instanceType"]);
}

// node_modules/typebox/build/type/types/function.mjs
function _Function_(parameters3, returnType, options = {}) {
  return exports_memory.Create({ ["~kind"]: "Function" }, { type: "function", parameters: parameters3, returnType }, options);
}
function IsFunction5(value2) {
  return IsKind3(value2, "Function");
}
function FunctionOptions(type6) {
  return exports_memory.Discard(type6, ["~kind", "type", "parameters", "returnType"]);
}

// node_modules/typebox/build/type/types/ref.mjs
function Ref3(ref6, options) {
  return exports_memory.Create({ ["~kind"]: "Ref" }, { $ref: ref6 }, options);
}
function IsRef4(value2) {
  return IsKind3(value2, "Ref");
}

// node_modules/typebox/build/type/types/generic.mjs
function Generic(parameters3, expression) {
  return exports_memory.Create({ "~kind": "Generic" }, { type: "generic", parameters: parameters3, expression });
}
function IsGeneric(value2) {
  return IsKind3(value2, "Generic");
}

// node_modules/typebox/build/type/types/any.mjs
function Any2(options) {
  return exports_memory.Create({ ["~kind"]: "Any" }, {}, options);
}
function IsAny3(value2) {
  return IsKind3(value2, "Any");
}

// node_modules/typebox/build/type/types/never.mjs
var NeverPattern = "(?!)";
function Never2(options) {
  return exports_memory.Create({ "~kind": "Never" }, { not: {} }, options);
}
function IsNever3(value2) {
  return IsKind3(value2, "Never");
}

// node_modules/typebox/build/type/action/_add_optional.mjs
function AddOptional2(type6, options = {}) {
  return AddOptionalAction(type6, options);
}

// node_modules/typebox/build/type/types/_optional.mjs
function IsOptional3(value2) {
  return IsSchema4(value2) && exports_guard.HasPropertyKey(value2, "~optional");
}

// node_modules/typebox/build/type/types/properties.mjs
function RequiredArray2(properties3) {
  return exports_guard.Keys(properties3).filter((key) => !IsOptional3(properties3[key]));
}
function PropertyKeys(properties3) {
  return exports_guard.Keys(properties3);
}
function PropertyValues(properties3) {
  return exports_guard.Values(properties3);
}

// node_modules/typebox/build/type/types/object.mjs
function _Object_(properties3, options = {}) {
  const requiredKeys = RequiredArray2(properties3);
  const required5 = requiredKeys.length > 0 ? { required: requiredKeys } : {};
  return exports_memory.Create({ "~kind": "Object" }, { type: "object", ...required5, properties: properties3 }, options);
}
function IsObject6(value2) {
  return IsKind3(value2, "Object");
}
function ObjectOptions(type6) {
  return exports_memory.Discard(type6, ["~kind", "type", "properties", "required"]);
}

// node_modules/typebox/build/type/types/unknown.mjs
function Unknown2(options) {
  return exports_memory.Create({ ["~kind"]: "Unknown" }, {}, options);
}
function IsUnknown3(value2) {
  return IsKind3(value2, "Unknown");
}

// node_modules/typebox/build/type/types/cyclic.mjs
function Cyclic($defs, $ref, options) {
  const defs2 = exports_guard.Keys($defs).reduce((result, key) => {
    return { ...result, [key]: exports_memory.Update($defs[key], {}, { $id: key }) };
  }, {});
  return exports_memory.Create({ ["~kind"]: "Cyclic" }, { $defs: defs2, $ref }, options);
}
function IsCyclic(value2) {
  return IsKind3(value2, "Cyclic");
}

// node_modules/typebox/build/type/types/unsafe.mjs
function IsUnsafe3(value2) {
  return exports_guard.IsObjectNotArray(value2) && exports_guard.HasPropertyKey(value2, "~unsafe") && exports_guard.IsNull(value2["~unsafe"]);
}

// node_modules/typebox/build/type/types/infer.mjs
function IsInfer(value2) {
  return IsKind3(value2, "Infer");
}

// node_modules/typebox/build/type/types/dependent.mjs
function Dependent(if_, then_, else_, options = {}) {
  return exports_memory.Create({ "~kind": "Dependent" }, { if: if_, then: then_, else: else_ }, options);
}
function IsDependent(value2) {
  return IsKind3(value2, "Dependent");
}
function DependentOptions(type6) {
  return exports_memory.Discard(type6, ["~kind", "if", "then", "else"]);
}

// node_modules/typebox/build/type/types/enum.mjs
function IsEnum2(value2) {
  return IsKind3(value2, "Enum");
}

// node_modules/typebox/build/type/types/intersect.mjs
function Intersect2(types2, options = {}) {
  return exports_memory.Create({ "~kind": "Intersect" }, { allOf: types2 }, options);
}
function IsIntersect3(value2) {
  return IsKind3(value2, "Intersect");
}
function IntersectOptions(type6) {
  return exports_memory.Discard(type6, ["~kind", "allOf"]);
}

// node_modules/typebox/build/type/types/_codec.mjs
function IsCodec(value2) {
  return IsSchema4(value2) && exports_guard.HasPropertyKey(value2, "~codec") && exports_guard.IsObject(value2["~codec"]) && exports_guard.HasPropertyKey(value2["~codec"], "encode") && exports_guard.HasPropertyKey(value2["~codec"], "decode");
}
// node_modules/typebox/build/type/types/_immutable.mjs
function IsImmutable(value2) {
  return IsSchema4(value2) && exports_guard.HasPropertyKey(value2, "~immutable");
}
// node_modules/typebox/build/type/action/_add_readonly.mjs
function AddReadonly2(type6, options = {}) {
  return AddReadonlyAction(type6, options);
}

// node_modules/typebox/build/type/types/_readonly.mjs
function IsReadonly3(value2) {
  return IsSchema4(value2) && exports_guard.HasPropertyKey(value2, "~readonly");
}
// node_modules/typebox/build/type/types/bigint.mjs
var BigIntPattern = "-?(?:0|[1-9][0-9]*)n";
function BigInt3(options) {
  return exports_memory.Create({ "~kind": "BigInt" }, { type: "bigint" }, options);
}
function IsBigInt5(value2) {
  return IsKind3(value2, "BigInt");
}
// node_modules/typebox/build/type/types/boolean.mjs
function IsBoolean6(value2) {
  return IsKind3(value2, "Boolean");
}
// node_modules/typebox/build/type/types/integer.mjs
var IntegerPattern = "-?(?:0|[1-9][0-9]*)";
function Integer2(options) {
  return exports_memory.Create({ "~kind": "Integer" }, { type: "integer" }, options);
}
function IsInteger4(value2) {
  return IsKind3(value2, "Integer");
}
// node_modules/typebox/build/type/types/literal.mjs
class InvalidLiteralValue extends Error {
  constructor(value2) {
    super(`Invalid Literal value`);
    Object.defineProperty(this, "cause", {
      value: { value: value2 },
      writable: false,
      configurable: false,
      enumerable: false
    });
  }
}
function LiteralTypeName(value2) {
  return exports_guard.IsBigInt(value2) ? "bigint" : exports_guard.IsBoolean(value2) ? "boolean" : exports_guard.IsNumber(value2) ? "number" : exports_guard.IsString(value2) ? "string" : (() => {
    throw new InvalidLiteralValue(value2);
  })();
}
function Literal2(value2, options) {
  return exports_memory.Create({ "~kind": "Literal" }, { type: LiteralTypeName(value2), const: value2 }, options);
}
function IsLiteralValue3(value2) {
  return exports_guard.IsBigInt(value2) || exports_guard.IsBoolean(value2) || exports_guard.IsNumber(value2) || exports_guard.IsString(value2);
}
function IsLiteralBigInt(value2) {
  return IsLiteral3(value2) && exports_guard.IsBigInt(value2.const);
}
function IsLiteralBoolean2(value2) {
  return IsLiteral3(value2) && exports_guard.IsBoolean(value2.const);
}
function IsLiteralNumber2(value2) {
  return IsLiteral3(value2) && exports_guard.IsNumber(value2.const);
}
function IsLiteralString2(value2) {
  return IsLiteral3(value2) && exports_guard.IsString(value2.const);
}
function IsLiteral3(value2) {
  return IsKind3(value2, "Literal");
}
// node_modules/typebox/build/type/types/null.mjs
function Null2(options) {
  return exports_memory.Create({ "~kind": "Null" }, { type: "null" }, options);
}
function IsNull5(value2) {
  return IsKind3(value2, "Null");
}
// node_modules/typebox/build/type/types/number.mjs
var NumberPattern = "-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?";
function Number3(options) {
  return exports_memory.Create({ "~kind": "Number" }, { type: "number" }, options);
}
function IsNumber7(value2) {
  return IsKind3(value2, "Number");
}
// node_modules/typebox/build/type/types/symbol.mjs
function Symbol3(options) {
  return exports_memory.Create({ "~kind": "Symbol" }, { type: "symbol" }, options);
}
function IsSymbol5(value2) {
  return IsKind3(value2, "Symbol");
}
// node_modules/typebox/build/type/types/string.mjs
var StringPattern = ".*";
function String3(options) {
  return exports_memory.Create({ "~kind": "String" }, { type: "string" }, options);
}
function IsString6(value2) {
  return IsKind3(value2, "String");
}

// node_modules/typebox/build/type/types/union.mjs
function Union2(anyOf3, options = {}) {
  return exports_memory.Create({ "~kind": "Union" }, { anyOf: anyOf3 }, options);
}
function IsUnion3(value2) {
  return IsKind3(value2, "Union");
}
function UnionOptions(type6) {
  return exports_memory.Discard(type6, ["~kind", "anyOf"]);
}

// node_modules/typebox/build/type/engine/patterns/pattern.mjs
function ParsePatternIntoTypes(pattern4) {
  const parsed = Pattern(pattern4);
  const result = exports_guard.IsEqual(parsed.length, 2) ? parsed[0] : [];
  return result;
}

// node_modules/typebox/build/type/engine/template_literal/is_finite.mjs
function FromLiteral3(_value) {
  return true;
}
function FromTypesReduce(types2) {
  return exports_guard.ShiftLeft(types2, (left, right) => FromType3(left) ? FromTypesReduce(right) : false, () => true);
}
function FromTypes3(types2) {
  const result = exports_guard.IsEqual(types2.length, 0) ? false : FromTypesReduce(types2);
  return result;
}
function FromType3(type6) {
  return IsUnion3(type6) ? FromTypes3(type6.anyOf) : IsLiteral3(type6) ? FromLiteral3(type6.const) : false;
}
function IsTemplateLiteralFinite2(types2) {
  const result = FromTypes3(types2);
  return result;
}

// node_modules/typebox/build/type/engine/template_literal/create.mjs
function TemplateLiteralCreate(pattern4) {
  return exports_memory.Create({ ["~kind"]: "TemplateLiteral" }, { type: "string", pattern: pattern4 }, {});
}

// node_modules/typebox/build/type/engine/template_literal/decode.mjs
function FromLiteralPush(variants, value2, result = []) {
  return exports_guard.ShiftLeft(variants, (left, right) => FromLiteralPush(right, value2, [...result, `${left}${value2}`]), () => result);
}
function FromLiteral4(variants, value2) {
  return exports_guard.IsEqual(variants.length, 0) ? [`${value2}`] : FromLiteralPush(variants, value2);
}
function FromUnion11(variants, types2, result = []) {
  return exports_guard.ShiftLeft(types2, (left, right) => FromUnion11(variants, right, [...result, ...FromType4(variants, left)]), () => result);
}
function FromType4(variants, type6) {
  const result = IsUnion3(type6) ? FromUnion11(variants, type6.anyOf) : IsLiteral3(type6) ? FromLiteral4(variants, type6.const) : Unreachable();
  return result;
}
function DecodeFromSpan(variants, types2) {
  return exports_guard.ShiftLeft(types2, (left, right) => DecodeFromSpan(FromType4(variants, left), right), () => variants);
}
function VariantsToLiterals(variants) {
  return variants.map((variant) => Literal2(variant));
}
function DecodeTypesAsUnion(types2) {
  const variants = DecodeFromSpan([], types2);
  const literals = VariantsToLiterals(variants);
  const result = Union2(literals);
  return result;
}
function DecodeTypes(types2) {
  return exports_guard.IsEqual(types2.length, 0) ? Unreachable() : exports_guard.IsEqual(types2.length, 1) && IsLiteral3(types2[0]) ? types2[0] : DecodeTypesAsUnion(types2);
}
function TemplateLiteralDecodeUnsafe(pattern4) {
  const types2 = ParsePatternIntoTypes(pattern4);
  const result = exports_guard.IsEqual(types2.length, 0) ? String3() : IsTemplateLiteralFinite2(types2) ? DecodeTypes(types2) : TemplateLiteralCreate(pattern4);
  return result;
}
function TemplateLiteralDecode(pattern4) {
  const decoded = TemplateLiteralDecodeUnsafe(pattern4);
  const result = IsTemplateLiteral3(decoded) ? String3() : decoded;
  return result;
}

// node_modules/typebox/build/type/engine/record/record_create.mjs
function CreateRecord(key, value2) {
  const type6 = "object";
  const patternProperties3 = { [key]: value2 };
  return exports_memory.Create({ ["~kind"]: "Record" }, { type: type6, patternProperties: patternProperties3 });
}

// node_modules/typebox/build/type/engine/record/from_key_any.mjs
function FromAnyKey2(value2) {
  return CreateRecord(StringKey, value2);
}

// node_modules/typebox/build/type/engine/record/from_key_boolean.mjs
function FromBooleanKey2(value2) {
  return _Object_({ true: value2, false: value2 });
}

// node_modules/typebox/build/type/types/tuple.mjs
function Tuple2(types2, options = {}) {
  const [items3, minItems3, additionalItems3] = [types2, types2.length, false];
  return exports_memory.Create({ ["~kind"]: "Tuple" }, { type: "array", additionalItems: additionalItems3, items: items3, minItems: minItems3 }, options);
}
function IsTuple3(value2) {
  return IsKind3(value2, "Tuple");
}
function TupleOptions(type6) {
  return exports_memory.Discard(type6, ["~kind", "type", "items", "minItems", "additionalItems"]);
}

// node_modules/typebox/build/type/engine/readonly/instantiate_remove.mjs
function RemoveReadonlyOperation(type6) {
  return exports_memory.Discard(type6, ["~readonly"]);
}
function RemoveReadonlyAction(type6, options) {
  const result = exports_memory.Update(RemoveReadonlyOperation(type6), {}, options);
  return result;
}
function RemoveReadonlyInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return RemoveReadonlyAction(instantiatedType, options);
}

// node_modules/typebox/build/type/action/_remove_readonly.mjs
function RemoveReadonly2(type6, options = {}) {
  return RemoveReadonlyAction(type6, options);
}

// node_modules/typebox/build/type/engine/optional/instantiate_remove.mjs
function RemoveOptionalOperation(type6) {
  return exports_memory.Discard(type6, ["~optional"]);
}
function RemoveOptionalAction(type6, options) {
  const result = exports_memory.Update(RemoveOptionalOperation(type6), {}, options);
  return result;
}
function RemoveOptionalInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return RemoveOptionalAction(instantiatedType, options);
}

// node_modules/typebox/build/type/action/_remove_optional.mjs
function RemoveOptional2(type6, options = {}) {
  return RemoveOptionalAction(type6, options);
}

// node_modules/typebox/build/type/engine/tuple/to_object.mjs
function TupleElementsToProperties(types2) {
  const result = types2.reduceRight((result2, right, index) => {
    return { [index]: right, ...result2 };
  }, {});
  return result;
}
function TupleToObject(type6) {
  const properties3 = TupleElementsToProperties(type6.items);
  const result = _Object_(properties3);
  return result;
}

// node_modules/typebox/build/type/engine/evaluate/composite.mjs
function IsReadonlyProperty(left, right) {
  return IsReadonly3(left) ? IsReadonly3(right) ? true : false : false;
}
function IsOptionalProperty(left, right) {
  return IsOptional3(left) ? IsOptional3(right) ? true : false : false;
}
function CompositeProperty2(left, right) {
  const isReadonly = IsReadonlyProperty(left, right);
  const isOptional = IsOptionalProperty(left, right);
  const evaluated = EvaluateIntersect([left, right]);
  const property = RemoveReadonly2(RemoveOptional2(evaluated));
  return isReadonly && isOptional ? AddReadonly2(AddOptional2(property)) : isReadonly && !isOptional ? AddReadonly2(property) : !isReadonly && isOptional ? AddOptional2(property) : property;
}
function CompositePropertyKey(left, right, key) {
  return key in left ? key in right ? CompositeProperty2(left[key], right[key]) : left[key] : (key in right) ? right[key] : Never2();
}
function CompositeProperties2(left, right) {
  const keys = new Set([...exports_guard.Keys(right), ...exports_guard.Keys(left)]);
  return [...keys].reduce((result, key) => {
    return { ...result, [key]: CompositePropertyKey(left, right, key) };
  }, {});
}
function GetProperties(type6) {
  const result = IsObject6(type6) ? type6.properties : IsTuple3(type6) ? TupleElementsToProperties(type6.items) : Unreachable();
  return result;
}
function Composite2(left, right) {
  const leftProperties = GetProperties(left);
  const rightProperties = GetProperties(right);
  const properties3 = CompositeProperties2(leftProperties, rightProperties);
  return _Object_(properties3);
}

// node_modules/typebox/build/type/engine/evaluate/narrow.mjs
function Narrow(left, right) {
  const result = Compare(left, right);
  return exports_guard.IsEqual(result, ResultLeftInside) ? left : exports_guard.IsEqual(result, ResultRightInside) ? right : exports_guard.IsEqual(result, ResultEqual) ? right : Never2();
}

// node_modules/typebox/build/type/engine/evaluate/distribute.mjs
function IsObjectLike(type6) {
  return IsObject6(type6) || IsTuple3(type6);
}
function IsUnionOperand(left, right) {
  const isUnionLeft = IsUnion3(left);
  const isUnionRight = IsUnion3(right);
  const result = isUnionLeft || isUnionRight;
  return result;
}
function DistributeOperation(left, right) {
  const evaluatedLeft = EvaluateType(left);
  const evaluatedRight = EvaluateType(right);
  const isUnionOperand = IsUnionOperand(evaluatedLeft, evaluatedRight);
  const isObjectLeft = IsObjectLike(evaluatedLeft);
  const IsObjectRight = IsObjectLike(evaluatedRight);
  const result = isUnionOperand ? EvaluateIntersect([evaluatedLeft, evaluatedRight]) : isObjectLeft && IsObjectRight ? Composite2(evaluatedLeft, evaluatedRight) : isObjectLeft && !IsObjectRight ? evaluatedLeft : !isObjectLeft && IsObjectRight ? evaluatedRight : Narrow(evaluatedLeft, evaluatedRight);
  return result;
}
function DistributeType(type6, types2, result = []) {
  return exports_guard.ShiftLeft(types2, (left, right) => DistributeType(type6, right, [...result, DistributeOperation(type6, left)]), () => exports_guard.IsEqual(result.length, 0) ? [type6] : result);
}
function DistributeUnion(types2, distribution, result = []) {
  return exports_guard.ShiftLeft(types2, (left, right) => DistributeUnion(right, distribution, [...result, ...Distribute([left], distribution)]), () => result);
}
function Distribute(types2, result = []) {
  return exports_guard.ShiftLeft(types2, (left, right) => IsUnion3(left) ? Distribute(right, DistributeUnion(left.anyOf, result)) : Distribute(right, DistributeType(left, result)), () => result);
}

// node_modules/typebox/build/type/engine/exclude/operation.mjs
function ExcludeType(left, right) {
  const check3 = Extends2({}, left, right);
  const result = exports_result.IsExtendsTrueLike(check3) ? [] : [left];
  return result;
}
function ExcludeUnion(types2, right) {
  return types2.reduce((result, head) => {
    return [...result, ...ExcludeType(head, right)];
  }, []);
}
function ExcludeOperation(left, right) {
  const evaluated = EvaluateType(left);
  const canonical = IsUnion3(evaluated) ? evaluated.anyOf : [evaluated];
  const remaining = ExcludeUnion(canonical, right);
  const result = EvaluateUnion(remaining);
  return result;
}

// node_modules/typebox/build/type/engine/evaluate/evaluate.mjs
function EvaluateDependent(if_, then_, else_) {
  const intersect3 = Intersect2([if_, then_]);
  const excluded = ExcludeOperation(else_, if_);
  const result = EvaluateUnion([intersect3, excluded]);
  return result;
}
function EvaluateEnum(values) {
  const result = values.map((value2) => Literal2(value2));
  return EvaluateUnion(result);
}
function EvaluateIntersect(types2) {
  const distribution = Distribute(types2);
  const broadend = Broaden(distribution);
  const result = EvaluateUnionFast(broadend);
  return result;
}
function EvaluateTemplateLiteral(pattern4) {
  const evaluated = TemplateLiteralDecode(pattern4);
  const result = EvaluateType(evaluated);
  return result;
}
function EvaluateUnion(types2) {
  const broadend = Broaden(types2);
  const result = EvaluateUnionFast(broadend);
  return result;
}
function EvaluateType(type6) {
  return IsDependent(type6) ? EvaluateDependent(type6.if, type6.then, type6.else) : IsEnum2(type6) ? EvaluateEnum(type6.enum) : IsIntersect3(type6) ? EvaluateIntersect(type6.allOf) : IsTemplateLiteral3(type6) ? EvaluateTemplateLiteral(type6.pattern) : IsUnion3(type6) ? EvaluateUnion(type6.anyOf) : type6;
}
function EvaluateUnionFast(types2) {
  const result = exports_guard.IsEqual(types2.length, 1) ? types2[0] : exports_guard.IsEqual(types2.length, 0) ? Never2() : Union2(types2);
  return result;
}

// node_modules/typebox/build/type/engine/record/from_key_enum.mjs
function FromEnumKey(values, value2) {
  const unionKey = EvaluateEnum(values);
  const result = FromKey(unionKey, value2);
  return result;
}

// node_modules/typebox/build/type/engine/record/from_key_integer.mjs
function FromIntegerKey2(_key, value2) {
  const result = CreateRecord(IntegerKey, value2);
  return result;
}

// node_modules/typebox/build/type/engine/record/from_key_intersect.mjs
function FromIntersectKey(types2, value2) {
  const evaluatedKey = EvaluateIntersect(types2);
  const result = FromKey(evaluatedKey, value2);
  return result;
}

// node_modules/typebox/build/type/engine/record/from_key_literal.mjs
function FromLiteralKey2(key, value2) {
  return exports_guard.IsString(key) || exports_guard.IsNumber(key) ? _Object_({ [key]: value2 }) : exports_guard.IsEqual(key, false) ? _Object_({ false: value2 }) : exports_guard.IsEqual(key, true) ? _Object_({ true: value2 }) : _Object_({});
}

// node_modules/typebox/build/type/engine/record/from_key_number.mjs
function FromNumberKey2(_key, value2) {
  const result = CreateRecord(NumberKey, value2);
  return result;
}

// node_modules/typebox/build/type/engine/record/from_key_string.mjs
function FromStringKey2(key, value2) {
  return exports_guard.HasPropertyKey(key, "pattern") && (exports_guard.IsString(key.pattern) || key.pattern instanceof RegExp) ? CreateRecord(key.pattern.toString(), value2) : CreateRecord(StringKey, value2);
}

// node_modules/typebox/build/type/engine/record/from_key_template_literal.mjs
function FromTemplateKey(pattern4, value2) {
  const types2 = ParsePatternIntoTypes(pattern4);
  const finite2 = IsTemplateLiteralFinite2(types2);
  const result = finite2 ? FromKey(EvaluateTemplateLiteral(pattern4), value2) : CreateRecord(pattern4, value2);
  return result;
}

// node_modules/typebox/build/type/engine/evaluate/flatten.mjs
function FlattenType(type6) {
  const result = IsUnion3(type6) ? Flatten(type6.anyOf) : [type6];
  return result;
}
function Flatten(types2) {
  return types2.reduce((result, type6) => {
    return [...result, ...FlattenType(type6)];
  }, []);
}

// node_modules/typebox/build/type/engine/record/from_key_union.mjs
function StringOrNumberCheck(types2) {
  return types2.some((type6) => IsString6(type6) || IsNumber7(type6) || IsInteger4(type6));
}
function TryBuildRecord(types2, value2) {
  return exports_guard.IsEqual(StringOrNumberCheck(types2), true) ? CreateRecord(StringKey, value2) : undefined;
}
function CreateProperties(types2, value2) {
  return types2.reduce((result, left) => {
    return IsLiteral3(left) && (exports_guard.IsString(left.const) || exports_guard.IsNumber(left.const)) ? { ...result, [left.const]: value2 } : result;
  }, {});
}
function CreateObject(types2, value2) {
  const properties3 = CreateProperties(types2, value2);
  const result = _Object_(properties3);
  return result;
}
function FromUnionKey2(types2, value2) {
  const flattened = Flatten(types2);
  const record3 = TryBuildRecord(flattened, value2);
  return IsSchema4(record3) ? record3 : CreateObject(flattened, value2);
}

// node_modules/typebox/build/type/engine/record/from_key.mjs
function FromKey(key, value2) {
  const result = IsAny3(key) ? FromAnyKey2(value2) : IsBoolean6(key) ? FromBooleanKey2(value2) : IsEnum2(key) ? FromEnumKey(key.enum, value2) : IsInteger4(key) ? FromIntegerKey2(key, value2) : IsIntersect3(key) ? FromIntersectKey(key.allOf, value2) : IsLiteral3(key) ? FromLiteralKey2(key.const, value2) : IsNumber7(key) ? FromNumberKey2(key, value2) : IsUnion3(key) ? FromUnionKey2(key.anyOf, value2) : IsString6(key) ? FromStringKey2(key, value2) : IsTemplateLiteral3(key) ? FromTemplateKey(key.pattern, value2) : _Object_({});
  return result;
}

// node_modules/typebox/build/type/engine/record/instantiate.mjs
function RecordAction(key, value2, options) {
  const result = CanInstantiate([key]) ? exports_memory.Update(FromKey(key, value2), {}, options) : RecordDeferred(key, value2, options);
  return result;
}
function RecordInstantiate(context, state, key, value2, options) {
  const instantiatedKey = InstantiateType(context, state, key);
  const instantiatedValue = InstantiateType(context, state, value2);
  return RecordAction(instantiatedKey, instantiatedValue, options);
}

// node_modules/typebox/build/type/types/record.mjs
var IntegerKey = `^${IntegerPattern}$`;
var NumberKey = `^${NumberPattern}$`;
var StringKey = `^${StringPattern}$`;
function RecordDeferred(key, value2, options = {}) {
  return Deferred("Record", [key, value2], options);
}
function Record2(key, value2, options = {}) {
  return RecordAction(key, value2, options);
}
function RecordFromPattern(pattern4, value2) {
  return CreateRecord(pattern4, value2);
}
function RecordPatternToType(pattern4) {
  const result = exports_guard.IsEqual(pattern4, StringKey) ? String3() : exports_guard.IsEqual(pattern4, IntegerKey) ? Integer2() : exports_guard.IsEqual(pattern4, NumberKey) ? Number3() : TemplateLiteralDecodeUnsafe(pattern4);
  return result;
}
function RecordPattern2(type6) {
  return exports_guard.Keys(type6.patternProperties)[0];
}
function RecordKey3(type6) {
  const pattern4 = RecordPattern2(type6);
  const result = RecordPatternToType(pattern4);
  return result;
}
function RecordValue3(type6) {
  return type6.patternProperties[RecordPattern2(type6)];
}
function IsRecord3(value2) {
  return IsKind3(value2, "Record");
}
// node_modules/typebox/build/type/types/rest.mjs
function Rest2(type6) {
  return exports_memory.Create({ "~kind": "Rest" }, { type: "rest", items: type6 }, {});
}
function IsRest(value2) {
  return IsKind3(value2, "Rest");
}
// node_modules/typebox/build/type/types/this.mjs
function IsThis3(value2) {
  return IsKind3(value2, "This");
}
// node_modules/typebox/build/type/types/undefined.mjs
function Undefined2(options) {
  return exports_memory.Create({ "~kind": "Undefined" }, { type: "undefined" }, options);
}
function IsUndefined6(value2) {
  return IsKind3(value2, "Undefined");
}
// node_modules/typebox/build/type/types/void.mjs
function IsVoid3(value2) {
  return IsKind3(value2, "Void");
}
// node_modules/typebox/build/type/script/mapping.mjs
function PatternBigIntMapping(input) {
  return BigInt3();
}
function PatternStringMapping(input) {
  return String3();
}
function PatternNumberMapping(input) {
  return Number3();
}
function PatternIntegerMapping(input) {
  return Integer2();
}
function PatternNeverMapping(input) {
  return Never2();
}
function PatternTextMapping(input) {
  return Literal2(input);
}
function PatternBaseMapping(input) {
  return input;
}
function PatternGroupMapping(input) {
  return Union2(input[1]);
}
function PatternUnionMapping(input) {
  return input.length === 3 ? [...input[0], ...input[2]] : input.length === 1 ? [...input[0]] : [];
}
function PatternTermMapping(input) {
  return [input[0], ...input[1]];
}
function PatternBodyMapping(input) {
  return input;
}
function PatternMapping(input) {
  return input[1];
}
// node_modules/typebox/build/type/script/token/internal/match.mjs
function IsMatch(value2) {
  return IsEqual(value2.length, 2);
}
function Match3(input, ok, fail2) {
  return IsMatch(input) ? ok(input[0], input[1]) : fail2();
}

// node_modules/typebox/build/type/script/token/internal/take.mjs
function TakeVariant(variant, input) {
  return IsEqual(input.indexOf(variant), 0) ? [variant, input.slice(variant.length)] : [];
}
function Take(variants, input) {
  for (let i = 0;i < variants.length; i++) {
    const result = TakeVariant(variants[i], input);
    if (IsMatch(result))
      return result;
  }
  return [];
}

// node_modules/typebox/build/type/script/token/internal/char.mjs
function Range(start, end) {
  return Array.from({ length: end - start + 1 }, (_2, i) => String.fromCharCode(start + i));
}
var Alpha = [
  ...Range(97, 122),
  ...Range(65, 90)
];
var Zero = "0";
var NonZero = Range(49, 57);
var Digit = [Zero, ...NonZero];
var WhiteSpace = " ";
var NewLine = `
`;
var UnderScore = "_";
var DollarSign = "$";

// node_modules/typebox/build/type/script/token/internal/trim.mjs
var LineComment = "//";
var OpenComment = "/*";
var CloseComment = "*/";
function DiscardMultilineComment(input) {
  const index = input.indexOf(CloseComment);
  const result = IsEqual(index, -1) ? "" : input.slice(index + 2);
  return result;
}
function DiscardLineComment(input) {
  const index = input.indexOf(NewLine);
  const result = IsEqual(index, -1) ? "" : input.slice(index);
  return result;
}
function TrimStartUntilNewline(input) {
  return input.replace(/^[ \t\r\f\v]+/, "");
}
function TrimWhitespace(input) {
  const trimmed = TrimStartUntilNewline(input);
  return trimmed.startsWith(OpenComment) ? TrimWhitespace(DiscardMultilineComment(trimmed.slice(2))) : trimmed.startsWith(LineComment) ? TrimWhitespace(DiscardLineComment(trimmed.slice(2))) : trimmed;
}
function Trim(input) {
  const trimmed = input.trimStart();
  return trimmed.startsWith(OpenComment) ? Trim(DiscardMultilineComment(trimmed.slice(2))) : trimmed.startsWith(LineComment) ? Trim(DiscardLineComment(trimmed.slice(2))) : trimmed;
}

// node_modules/typebox/build/type/script/token/unsigned_integer.mjs
var AllowedDigits = [...Digit, UnderScore];
// node_modules/typebox/build/type/script/token/const.mjs
function TakeConst(const_, input) {
  return Take([const_], input);
}
function Const2(const_, input) {
  return IsEqual(const_, "") ? ["", input] : const_.startsWith(NewLine) ? TakeConst(const_, TrimWhitespace(input)) : const_.startsWith(WhiteSpace) ? TakeConst(const_, input) : TakeConst(const_, Trim(input));
}
// node_modules/typebox/build/type/script/token/ident.mjs
var Initial = [...Alpha, UnderScore, DollarSign];
var Remaining = [...Initial, ...Digit];
// node_modules/typebox/build/type/script/token/unsigned_number.mjs
var AllowedDigits2 = [...Digit, UnderScore];
// node_modules/typebox/build/type/script/token/until.mjs
function TakeOne(input) {
  const result = IsEqual(input, "") ? [] : [input.slice(0, 1), input.slice(1)];
  return result;
}
function IsInputMatchSentinal(end, input) {
  return ShiftLeft(end, (left, right) => input.startsWith(left) ? true : IsInputMatchSentinal(right, input), () => false);
}
function Until(end, input, result = "") {
  return Match3(TakeOne(input), (One, Rest3) => IsInputMatchSentinal(end, input) ? [result, input] : Until(end, Rest3, `${result}${One}`), () => []);
}
// node_modules/typebox/build/type/script/token/until_1.mjs
function Until_1(end, input) {
  return Match3(Until(end, input), (Until2, UntilRest) => IsEqual(Until2, "") ? [] : [Until2, UntilRest], () => []);
}
// node_modules/typebox/build/type/script/parser.mjs
var If = (result, left, right = () => []) => result.length === 2 ? left(result) : right();
var PatternBigInt = (input) => If(Const2("-?(?:0|[1-9][0-9]*)n", input), ([_0, input2]) => [PatternBigIntMapping(_0), input2]);
var PatternString2 = (input) => If(Const2(".*", input), ([_0, input2]) => [PatternStringMapping(_0), input2]);
var PatternNumber2 = (input) => If(Const2("-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?", input), ([_0, input2]) => [PatternNumberMapping(_0), input2]);
var PatternInteger = (input) => If(Const2("-?(?:0|[1-9][0-9]*)", input), ([_0, input2]) => [PatternIntegerMapping(_0), input2]);
var PatternNever2 = (input) => If(Const2("(?!)", input), ([_0, input2]) => [PatternNeverMapping(_0), input2]);
var PatternText = (input) => If(Until_1(["-?(?:0|[1-9][0-9]*)n", ".*", "-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?", "-?(?:0|[1-9][0-9]*)", "(?!)", "(", ")", "$", "|"], input), ([_0, input2]) => [PatternTextMapping(_0), input2]);
var PatternBase = (input) => If(If(PatternBigInt(input), ([_0, input2]) => [_0, input2], () => If(PatternString2(input), ([_0, input2]) => [_0, input2], () => If(PatternNumber2(input), ([_0, input2]) => [_0, input2], () => If(PatternInteger(input), ([_0, input2]) => [_0, input2], () => If(PatternNever2(input), ([_0, input2]) => [_0, input2], () => If(PatternGroup(input), ([_0, input2]) => [_0, input2], () => If(PatternText(input), ([_0, input2]) => [_0, input2], () => []))))))), ([_0, input2]) => [PatternBaseMapping(_0), input2]);
var PatternGroup = (input) => If(If(Const2("(", input), ([_0, input2]) => If(PatternBody(input2), ([_1, input3]) => If(Const2(")", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [PatternGroupMapping(_0), input2]);
var PatternUnion = (input) => If(If(If(PatternTerm(input), ([_0, input2]) => If(Const2("|", input2), ([_1, input3]) => If(PatternUnion(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [_0, input2], () => If(If(PatternTerm(input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => []))), ([_0, input2]) => [PatternUnionMapping(_0), input2]);
var PatternTerm = (input) => If(If(PatternBase(input), ([_0, input2]) => If(PatternBody(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [PatternTermMapping(_0), input2]);
var PatternBody = (input) => If(If(PatternUnion(input), ([_0, input2]) => [_0, input2], () => If(PatternTerm(input), ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [PatternBodyMapping(_0), input2]);
var Pattern = (input) => If(If(Const2("^", input), ([_0, input2]) => If(PatternBody(input2), ([_1, input3]) => If(Const2("$", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [PatternMapping(_0), input2]);

// node_modules/typebox/build/type/engine/template_literal/encode.mjs
function JoinString(input) {
  return input.join("|");
}
function UnwrapTemplateLiteralPattern(pattern4) {
  return pattern4.slice(1, pattern4.length - 1);
}
function EncodeLiteral(value2, right, pattern4) {
  return EncodeTypes(right, `${pattern4}${value2}`);
}
function EncodeBigInt(right, pattern4) {
  return EncodeTypes(right, `${pattern4}${BigIntPattern}`);
}
function EncodeInteger(right, pattern4) {
  return EncodeTypes(right, `${pattern4}${IntegerPattern}`);
}
function EncodeNumber(right, pattern4) {
  return EncodeTypes(right, `${pattern4}${NumberPattern}`);
}
function EncodeBoolean(right, pattern4) {
  return EncodeType(Union2([Literal2("false"), Literal2("true")]), right, pattern4);
}
function EncodeString(right, pattern4) {
  return EncodeTypes(right, `${pattern4}${StringPattern}`);
}
function EncodeTemplateLiteral(templatePattern, right, pattern4) {
  return EncodeTypes(right, `${pattern4}${UnwrapTemplateLiteralPattern(templatePattern)}`);
}
function EncodeTemplateLiteralDeferred(types2, right, pattern4) {
  const templateLiteral = TemplateLiteralAction(types2, {});
  const result = EncodeType(templateLiteral, right, pattern4);
  return result;
}
function EncodeEnum(values, right, pattern4) {
  const evaluated = EvaluateEnum(values);
  return EncodeType(evaluated, right, pattern4);
}
function EncodeUnion(types2, right, pattern4, result = []) {
  return exports_guard.ShiftLeft(types2, (head, tail) => EncodeUnion(tail, right, pattern4, [...result, EncodeType(head, [], "")]), () => EncodeTypes(right, `${pattern4}(${JoinString(result)})`));
}
function EncodeType(type6, right, pattern4) {
  return IsEnum2(type6) ? EncodeEnum(type6.enum, right, pattern4) : IsInteger4(type6) ? EncodeInteger(right, pattern4) : IsLiteral3(type6) ? EncodeLiteral(type6.const, right, pattern4) : IsBigInt5(type6) ? EncodeBigInt(right, pattern4) : IsBoolean6(type6) ? EncodeBoolean(right, pattern4) : IsNumber7(type6) ? EncodeNumber(right, pattern4) : IsString6(type6) ? EncodeString(right, pattern4) : IsTemplateLiteral3(type6) ? EncodeTemplateLiteral(type6.pattern, right, pattern4) : IsTemplateLiteralDeferred(type6) ? EncodeTemplateLiteralDeferred(type6.parameters[0], right, pattern4) : IsUnion3(type6) ? EncodeUnion(type6.anyOf, right, pattern4) : NeverPattern;
}
function EncodeTypes(types2, pattern4) {
  return exports_guard.ShiftLeft(types2, (left, right) => EncodeType(left, right, pattern4), () => pattern4);
}
function EncodePattern(types2) {
  const encoded = EncodeTypes(types2, "");
  const result = `^${encoded}$`;
  return result;
}
function TemplateLiteralEncode(types2) {
  const pattern4 = EncodePattern(types2);
  const result = TemplateLiteralCreate(pattern4);
  return result;
}

// node_modules/typebox/build/type/engine/template_literal/instantiate.mjs
function TemplateLiteralAction(types2, options) {
  const result = CanInstantiate(types2) ? exports_memory.Update(TemplateLiteralEncode(types2), {}, options) : TemplateLiteralDeferred(types2, options);
  return result;
}
function TemplateLiteralInstantiate(context, state, types2, options) {
  const instantiatedTypes = InstantiateTypes(context, state, types2);
  return TemplateLiteralAction(instantiatedTypes, options);
}

// node_modules/typebox/build/type/types/template_literal.mjs
function TemplateLiteralDeferred(types2, options = {}) {
  return Deferred("TemplateLiteral", [types2], options);
}
function IsTemplateLiteralDeferred(value2) {
  return IsSchema4(value2) && exports_guard.HasPropertyKey(value2, "action") && exports_guard.IsEqual(value2.action, "TemplateLiteral");
}
function IsTemplateLiteral3(value2) {
  return IsKind3(value2, "TemplateLiteral");
}

// node_modules/typebox/build/type/extends/result.mjs
var exports_result = {};
__export(exports_result, {
  Match: () => Match4,
  IsExtendsUnion: () => IsExtendsUnion,
  IsExtendsTrueLike: () => IsExtendsTrueLike,
  IsExtendsTrue: () => IsExtendsTrue,
  IsExtendsFalse: () => IsExtendsFalse,
  ExtendsUnion: () => ExtendsUnion,
  ExtendsTrue: () => ExtendsTrue,
  ExtendsFalse: () => ExtendsFalse
});
function ExtendsUnion(inferred) {
  return exports_memory.Create({ ["~kind"]: "ExtendsUnion" }, { inferred });
}
function IsExtendsUnion(value2) {
  return exports_guard.IsObject(value2) && exports_guard.HasPropertyKey(value2, "~kind") && exports_guard.HasPropertyKey(value2, "inferred") && exports_guard.IsEqual(value2["~kind"], "ExtendsUnion") && exports_guard.IsObject(value2.inferred);
}
function ExtendsTrue(inferred) {
  return exports_memory.Create({ ["~kind"]: "ExtendsTrue" }, { inferred });
}
function IsExtendsTrue(value2) {
  return exports_guard.IsObject(value2) && exports_guard.HasPropertyKey(value2, "~kind") && exports_guard.HasPropertyKey(value2, "inferred") && exports_guard.IsEqual(value2["~kind"], "ExtendsTrue") && exports_guard.IsObject(value2.inferred);
}
function ExtendsFalse() {
  return exports_memory.Create({ ["~kind"]: "ExtendsFalse" }, {});
}
function IsExtendsFalse(value2) {
  return exports_guard.IsObject(value2) && exports_guard.HasPropertyKey(value2, "~kind") && exports_guard.IsEqual(value2["~kind"], "ExtendsFalse");
}
function IsExtendsTrueLike(value2) {
  return IsExtendsUnion(value2) || IsExtendsTrue(value2);
}
function Match4(result, true_, false_) {
  return IsExtendsTrueLike(result) ? true_(result.inferred) : false_();
}

// node_modules/typebox/build/type/extends/extends_right.mjs
function ExtendsRightInfer(inferred, name, left, right) {
  return Match4(ExtendsLeft(inferred, left, right), (checkInferred) => ExtendsTrue(exports_memory.Assign(exports_memory.Assign(inferred, checkInferred), { [name]: left })), () => ExtendsFalse());
}
function ExtendsRightAny(inferred, _left) {
  return ExtendsTrue(inferred);
}
function ExtendsRightDependent(inferred, left, if_, then_, else_) {
  return Match4(ExtendsLeft(inferred, left, if_), (inferred2) => Match4(ExtendsLeft(inferred2, left, then_), (inferred3) => ExtendsTrue(inferred3), () => ExtendsFalse()), () => Match4(ExtendsLeft(inferred, left, else_), (inferred2) => ExtendsTrue(inferred2), () => ExtendsFalse()));
}
function ExtendsRightEnum(inferred, left, right) {
  const evaluated = EvaluateEnum(right);
  return ExtendsLeft(inferred, left, evaluated);
}
function ExtendsRightIntersect(inferred, left, right) {
  return exports_guard.ShiftLeft(right, (head, tail) => Match4(ExtendsLeft(inferred, left, head), (inferred2) => ExtendsRightIntersect(inferred2, left, tail), () => ExtendsFalse()), () => ExtendsTrue(inferred));
}
function ExtendsRightTemplateLiteral(inferred, left, right) {
  const evaluated = EvaluateTemplateLiteral(right);
  return ExtendsLeft(inferred, left, evaluated);
}
function ExtendsRightUnion(inferred, left, right) {
  return exports_guard.ShiftLeft(right, (head, tail) => Match4(ExtendsLeft(inferred, left, head), (inferred2) => ExtendsTrue(inferred2), () => ExtendsRightUnion(inferred, left, tail)), () => ExtendsFalse());
}
function ExtendsRight(inferred, left, right) {
  return IsAny3(right) ? ExtendsRightAny(inferred, left) : IsDependent(right) ? ExtendsRightDependent(inferred, left, right.if, right.then, right.else) : IsEnum2(right) ? ExtendsRightEnum(inferred, left, right.enum) : IsInfer(right) ? ExtendsRightInfer(inferred, right.name, left, right.extends) : IsIntersect3(right) ? ExtendsRightIntersect(inferred, left, right.allOf) : IsTemplateLiteral3(right) ? ExtendsRightTemplateLiteral(inferred, left, right.pattern) : IsUnion3(right) ? ExtendsRightUnion(inferred, left, right.anyOf) : IsUnknown3(right) ? ExtendsTrue(inferred) : ExtendsFalse();
}

// node_modules/typebox/build/type/extends/any.mjs
function ExtendsAny(inferred, left, right) {
  return IsInfer(right) ? ExtendsRight(inferred, left, right) : IsAny3(right) ? ExtendsTrue(inferred) : IsUnknown3(right) ? ExtendsTrue(inferred) : ExtendsUnion(inferred);
}

// node_modules/typebox/build/type/extends/array.mjs
function ExtendsImmutable(left, right) {
  const isImmutableLeft = IsImmutable(left);
  const isImmutableRight = IsImmutable(right);
  return isImmutableLeft && isImmutableRight ? true : !isImmutableLeft && isImmutableRight ? true : isImmutableLeft && !isImmutableRight ? false : true;
}
function ExtendsArray(inferred, arrayLeft, left, right) {
  return IsArray6(right) ? ExtendsImmutable(arrayLeft, right) ? ExtendsLeft(inferred, left, right.items) : ExtendsFalse() : ExtendsRight(inferred, arrayLeft, right);
}

// node_modules/typebox/build/type/extends/bigint.mjs
function ExtendsBigInt(inferred, left, right) {
  return IsBigInt5(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// node_modules/typebox/build/type/extends/boolean.mjs
function ExtendsBoolean(inferred, left, right) {
  return IsBoolean6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// node_modules/typebox/build/type/extends/parameters.mjs
function ParameterCompare(inferred, left, leftRest, right, rightRest) {
  const checkLeft = IsInfer(right) ? left : right;
  const checkRight = IsInfer(right) ? right : left;
  const isLeftOptional = IsOptional3(left);
  const isRightOptional = IsOptional3(right);
  return !isLeftOptional && isRightOptional ? ExtendsFalse() : Match4(ExtendsLeft(inferred, checkLeft, checkRight), (inferred2) => ExtendsParameters(inferred2, leftRest, rightRest), () => ExtendsFalse());
}
function ParameterRight(inferred, left, leftRest, rightRest) {
  return exports_guard.ShiftLeft(rightRest, (head, tail) => ParameterCompare(inferred, left, leftRest, head, tail), () => IsOptional3(left) ? ExtendsTrue(inferred) : ExtendsFalse());
}
function ParametersLeft(inferred, left, rightRest) {
  return exports_guard.ShiftLeft(left, (head, tail) => ParameterRight(inferred, head, tail, rightRest), () => ExtendsTrue(inferred));
}
function ExtendsParameters(inferred, left, right) {
  return ParametersLeft(inferred, left, right);
}

// node_modules/typebox/build/type/extends/return_type.mjs
function ExtendsReturnType(inferred, left, right) {
  return IsVoid3(right) ? ExtendsTrue(inferred) : ExtendsLeft(inferred, left, right);
}

// node_modules/typebox/build/type/extends/constructor.mjs
function ExtendsConstructor(inferred, parameters3, returnType, right) {
  return IsAny3(right) ? ExtendsTrue(inferred) : IsUnknown3(right) ? ExtendsTrue(inferred) : IsConstructor4(right) ? Match4(ExtendsParameters(inferred, parameters3, right["parameters"]), (inferred2) => ExtendsReturnType(inferred2, returnType, right["instanceType"]), () => ExtendsFalse()) : ExtendsFalse();
}

// node_modules/typebox/build/type/extends/dependent.mjs
function ExtendsDependent(inferred, if_, then_, else_, right) {
  return Match4(ExtendsLeft(inferred, if_, right), () => ExtendsLeft(inferred, then_, right), () => ExtendsLeft(inferred, else_, right));
}

// node_modules/typebox/build/type/extends/enum.mjs
function ExtendsEnum(inferred, left, right) {
  const evaluated = EvaluateEnum(left);
  return ExtendsLeft(inferred, evaluated, right);
}

// node_modules/typebox/build/type/extends/function.mjs
function ExtendsFunction(inferred, parameters3, returnType, right) {
  return IsAny3(right) ? ExtendsTrue(inferred) : IsUnknown3(right) ? ExtendsTrue(inferred) : IsFunction5(right) ? Match4(ExtendsParameters(inferred, parameters3, right["parameters"]), (inferred2) => ExtendsReturnType(inferred2, returnType, right["returnType"]), () => ExtendsFalse()) : ExtendsFalse();
}

// node_modules/typebox/build/type/extends/integer.mjs
function ExtendsInteger(inferred, left, right) {
  return IsInteger4(right) ? ExtendsTrue(inferred) : IsNumber7(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// node_modules/typebox/build/type/extends/intersect.mjs
function ExtendsIntersect(inferred, left, right) {
  const evaluated = EvaluateIntersect(left);
  return ExtendsLeft(inferred, evaluated, right);
}

// node_modules/typebox/build/type/extends/literal.mjs
function ExtendsLiteralValue(inferred, left, right) {
  return left === right ? ExtendsTrue(inferred) : ExtendsFalse();
}
function ExtendsLiteralBigInt(inferred, left, right) {
  return IsLiteral3(right) ? ExtendsLiteralValue(inferred, left, right.const) : IsBigInt5(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, Literal2(left), right);
}
function ExtendsLiteralBoolean(inferred, left, right) {
  return IsLiteral3(right) ? ExtendsLiteralValue(inferred, left, right.const) : IsBoolean6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, Literal2(left), right);
}
function ExtendsLiteralNumber(inferred, left, right) {
  return IsLiteral3(right) ? ExtendsLiteralValue(inferred, left, right.const) : IsNumber7(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, Literal2(left), right);
}
function ExtendsLiteralString(inferred, left, right) {
  return IsLiteral3(right) ? ExtendsLiteralValue(inferred, left, right.const) : IsString6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, Literal2(left), right);
}
function ExtendsLiteral(inferred, left, right) {
  return exports_guard.IsBigInt(left.const) ? ExtendsLiteralBigInt(inferred, left.const, right) : exports_guard.IsBoolean(left.const) ? ExtendsLiteralBoolean(inferred, left.const, right) : exports_guard.IsNumber(left.const) ? ExtendsLiteralNumber(inferred, left.const, right) : exports_guard.IsString(left.const) ? ExtendsLiteralString(inferred, left.const, right) : Unreachable();
}

// node_modules/typebox/build/type/extends/never.mjs
function ExtendsNever(inferred, left, right) {
  return IsInfer(right) ? ExtendsRight(inferred, left, right) : ExtendsTrue(inferred);
}

// node_modules/typebox/build/type/extends/null.mjs
function ExtendsNull(inferred, left, right) {
  return IsNull5(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// node_modules/typebox/build/type/extends/number.mjs
function ExtendsNumber(inferred, left, right) {
  return IsNumber7(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// node_modules/typebox/build/type/extends/object.mjs
function ExtendsPropertyOptional(inferred, left, right) {
  return IsOptional3(left) ? IsOptional3(right) ? ExtendsTrue(inferred) : ExtendsFalse() : ExtendsTrue(inferred);
}
function ExtendsProperty(inferred, left, right) {
  return IsInfer(right) && IsNever3(right.extends) ? ExtendsFalse() : Match4(ExtendsLeft(inferred, left, right), (inferred2) => ExtendsPropertyOptional(inferred2, left, right), () => ExtendsFalse());
}
function ExtractInferredProperties(keys, properties4) {
  return keys.reduce((result, key) => {
    return key in properties4 ? IsExtendsTrueLike(properties4[key]) ? { ...result, ...properties4[key].inferred } : Unreachable() : Unreachable();
  }, {});
}
function ExtendsPropertiesComparer(inferred, left, right) {
  const properties4 = {};
  for (const rightKey of exports_guard.Keys(right)) {
    properties4[rightKey] = rightKey in left ? ExtendsProperty({}, left[rightKey], right[rightKey]) : IsOptional3(right[rightKey]) ? IsInfer(right[rightKey]) ? ExtendsTrue(exports_memory.Assign(inferred, { [right[rightKey].name]: right[rightKey].extends })) : ExtendsTrue(inferred) : ExtendsFalse();
  }
  const checked = exports_guard.Values(properties4).every((result) => IsExtendsTrueLike(result));
  const extracted = checked ? ExtractInferredProperties(exports_guard.Keys(properties4), properties4) : {};
  return checked ? ExtendsTrue(extracted) : ExtendsFalse();
}
function ExtendsProperties(inferred, left, right) {
  const compared = ExtendsPropertiesComparer(inferred, left, right);
  return IsExtendsTrueLike(compared) ? ExtendsTrue(exports_memory.Assign(inferred, compared.inferred)) : ExtendsFalse();
}
function ExtendsObjectToObject(inferred, left, right) {
  return ExtendsProperties(inferred, left, right);
}
function RecordMergeInferred(left, right) {
  return exports_guard.Keys(right).reduce((result, key) => {
    return {
      ...result,
      [key]: exports_guard.HasPropertyKey(left, key) ? IsUnion3(result[key]) ? Union2([...result[key].anyOf, right[key]]) : Union2([left[key], right[key]]) : right[key]
    };
  }, left);
}
function ExtendsRecordComparer(properties4, keys, type6, result) {
  return exports_guard.ShiftLeft(keys, (left, right) => Match4(ExtendsLeft({}, properties4[left], type6), (inferred) => ExtendsRecordComparer(properties4, right, type6, RecordMergeInferred(result, inferred)), () => ExtendsFalse()), () => ExtendsTrue(result));
}
function ExtendsObjectToRecord(inferred, properties4, _pattern, value2) {
  const keys = exports_guard.Keys(properties4);
  const result = ExtendsRecordComparer(properties4, keys, value2, inferred);
  return result;
}
function ExtendsObject(inferred, left, right) {
  return IsRecord3(right) ? ExtendsObjectToRecord(inferred, left, RecordPattern2(right), RecordValue3(right)) : IsObject6(right) ? ExtendsObjectToObject(inferred, left, right.properties) : ExtendsRight(inferred, _Object_(left), right);
}

// node_modules/typebox/build/type/extends/record.mjs
function FromObject11(inferred, properties4) {
  return exports_guard.IsEqual(exports_guard.Keys(properties4).length, 0) ? ExtendsTrue(inferred) : ExtendsFalse();
}
function FromRecord4(inferred, _leftKey, leftValue, _rightKey, rightValue) {
  return ExtendsLeft(inferred, leftValue, rightValue);
}
function ExtendsRecord(inferred, leftPattern, leftValue, right) {
  return IsRecord3(right) ? FromRecord4(inferred, RecordPatternToType(leftPattern), leftValue, RecordPatternToType(RecordPattern2(right)), RecordValue3(right)) : IsObject6(right) ? FromObject11(inferred, right.properties) : IsAny3(right) ? ExtendsTrue(inferred) : IsUnknown3(right) ? ExtendsTrue(inferred) : ExtendsFalse();
}

// node_modules/typebox/build/type/extends/string.mjs
function ExtendsString(inferred, left, right) {
  return IsString6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// node_modules/typebox/build/type/extends/symbol.mjs
function ExtendsSymbol(inferred, left, right) {
  return IsSymbol5(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// node_modules/typebox/build/type/extends/template_literal.mjs
function ExtendsTemplateLiteral(inferred, left, right) {
  const evaluated = EvaluateTemplateLiteral(left);
  return ExtendsLeft(inferred, evaluated, right);
}

// node_modules/typebox/build/type/extends/inference.mjs
function Inferrable(name, type6) {
  return exports_memory.Create({ "~kind": "Inferrable" }, { name, type: type6 }, {});
}
function IsInferable(value2) {
  return exports_guard.IsObject(value2) && exports_guard.HasPropertyKey(value2, "~kind") && exports_guard.HasPropertyKey(value2, "name") && exports_guard.HasPropertyKey(value2, "type") && exports_guard.IsEqual(value2["~kind"], "Inferrable") && exports_guard.IsString(value2.name) && exports_guard.IsObject(value2.type);
}
function TryRestInferable(type6) {
  return IsRest(type6) ? IsInfer(type6.items) ? IsArray6(type6.items.extends) ? Inferrable(type6.items.name, type6.items.extends.items) : IsUnknown3(type6.items.extends) ? Inferrable(type6.items.name, type6.items.extends) : undefined : Unreachable() : undefined;
}
function TryInferable(type6) {
  return IsInfer(type6) ? Inferrable(type6.name, type6.extends) : undefined;
}
function TryInferResults(rest5, right, result = []) {
  return exports_guard.ShiftLeft(rest5, (head, tail) => Match4(ExtendsLeft({}, head, right), () => TryInferResults(tail, right, [...result, head]), () => {
    return;
  }), () => result);
}
function InferTupleResult(inferred, name, left, right) {
  const results = TryInferResults(left, right);
  return exports_guard.IsArray(results) ? ExtendsTrue(exports_memory.Assign(inferred, { [name]: Tuple2(results) })) : ExtendsFalse();
}
function InferUnionResult(inferred, name, left, right) {
  const results = TryInferResults(left, right);
  return exports_guard.IsArray(results) ? ExtendsTrue(exports_memory.Assign(inferred, { [name]: Union2(results) })) : ExtendsFalse();
}

// node_modules/typebox/build/type/extends/tuple.mjs
function Reverse(types2) {
  return [...types2].reverse();
}
function ApplyReverse(types2, reversed) {
  return reversed ? Reverse(types2) : types2;
}
function Reversed(types2) {
  const first = types2.length > 0 ? types2[0] : undefined;
  const inferrable = IsSchema4(first) ? TryRestInferable(first) : undefined;
  return IsSchema4(inferrable);
}
function ElementsCompare(inferred, reversed, left, leftRest, right, rightRest) {
  return Match4(ExtendsLeft(inferred, left, right), (checkInferred) => Elements(checkInferred, reversed, leftRest, rightRest), () => ExtendsFalse());
}
function ElementsLeft(inferred, reversed, leftRest, right, rightRest) {
  const inferable = TryRestInferable(right);
  return IsInferable(inferable) ? InferTupleResult(inferred, inferable["name"], ApplyReverse(leftRest, reversed), inferable["type"]) : exports_guard.ShiftLeft(leftRest, (head, tail) => ElementsCompare(inferred, reversed, head, tail, right, rightRest), () => ExtendsFalse());
}
function ElementsRight(inferred, reversed, leftRest, rightRest) {
  return exports_guard.ShiftLeft(rightRest, (head, tail) => ElementsLeft(inferred, reversed, leftRest, head, tail), () => exports_guard.IsEqual(leftRest.length, 0) ? ExtendsTrue(inferred) : ExtendsFalse());
}
function Elements(inferred, reversed, leftRest, rightRest) {
  return ElementsRight(inferred, reversed, leftRest, rightRest);
}
function ExtendsTupleToTuple(inferred, left, right) {
  const instantiatedRight = InstantiateElements(inferred, State([], []), right);
  const reversed = Reversed(instantiatedRight);
  return Elements(inferred, reversed, ApplyReverse(left, reversed), ApplyReverse(instantiatedRight, reversed));
}
function ExtendsTupleToArray(inferred, left, right) {
  const inferrable = TryInferable(right);
  return IsInferable(inferrable) ? InferUnionResult(inferred, inferrable["name"], left, inferrable["type"]) : exports_guard.ShiftLeft(left, (head, tail) => Match4(ExtendsLeft(inferred, head, right), (inferred2) => ExtendsTupleToArray(inferred2, tail, right), () => ExtendsFalse()), () => ExtendsTrue(inferred));
}
function ExtendsTuple(inferred, left, right) {
  const instantiatedLeft = InstantiateElements(inferred, State([], []), left);
  return IsTuple3(right) ? ExtendsTupleToTuple(inferred, instantiatedLeft, right.items) : IsArray6(right) ? ExtendsTupleToArray(inferred, instantiatedLeft, right.items) : ExtendsRight(inferred, Tuple2(instantiatedLeft), right);
}

// node_modules/typebox/build/type/extends/undefined.mjs
function ExtendsUndefined(inferred, left, right) {
  return IsVoid3(right) ? ExtendsTrue(inferred) : IsUndefined6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// node_modules/typebox/build/type/extends/union.mjs
function ExtendsUnionSome(inferred, type6, unionTypes) {
  return exports_guard.ShiftLeft(unionTypes, (head, tail) => Match4(ExtendsLeft(inferred, type6, head), (inferred2) => ExtendsTrue(inferred2), () => ExtendsUnionSome(inferred, type6, tail)), () => ExtendsFalse());
}
function ExtendsUnionLeft(inferred, left, right) {
  return exports_guard.ShiftLeft(left, (head, tail) => Match4(ExtendsUnionSome(inferred, head, right), (inferred2) => ExtendsUnionLeft(inferred2, tail, right), () => ExtendsFalse()), () => ExtendsTrue(inferred));
}
function ExtendsUnion2(inferred, left, right) {
  const inferrable = TryInferable(right);
  return IsInferable(inferrable) ? InferUnionResult(inferred, inferrable.name, left, inferrable.type) : IsUnion3(right) ? ExtendsUnionLeft(inferred, left, right.anyOf) : ExtendsUnionLeft(inferred, left, [right]);
}

// node_modules/typebox/build/type/extends/unknown.mjs
function ExtendsUnknown(inferred, left, right) {
  return IsInfer(right) ? ExtendsRight(inferred, left, right) : IsAny3(right) ? ExtendsTrue(inferred) : IsUnknown3(right) ? ExtendsTrue(inferred) : ExtendsFalse();
}

// node_modules/typebox/build/type/extends/void.mjs
function ExtendsVoid(inferred, left, right) {
  return IsVoid3(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// node_modules/typebox/build/type/extends/extends_left.mjs
function ExtendsLeft(inferred, left, right) {
  return IsAny3(left) ? ExtendsAny(inferred, left, right) : IsArray6(left) ? ExtendsArray(inferred, left, left.items, right) : IsBigInt5(left) ? ExtendsBigInt(inferred, left, right) : IsBoolean6(left) ? ExtendsBoolean(inferred, left, right) : IsConstructor4(left) ? ExtendsConstructor(inferred, left.parameters, left.instanceType, right) : IsDependent(left) ? ExtendsDependent(inferred, left.if, left.then, left.else, right) : IsEnum2(left) ? ExtendsEnum(inferred, left.enum, right) : IsFunction5(left) ? ExtendsFunction(inferred, left.parameters, left.returnType, right) : IsInteger4(left) ? ExtendsInteger(inferred, left, right) : IsIntersect3(left) ? ExtendsIntersect(inferred, left.allOf, right) : IsLiteral3(left) ? ExtendsLiteral(inferred, left, right) : IsNever3(left) ? ExtendsNever(inferred, left, right) : IsNull5(left) ? ExtendsNull(inferred, left, right) : IsNumber7(left) ? ExtendsNumber(inferred, left, right) : IsObject6(left) ? ExtendsObject(inferred, left.properties, right) : IsRecord3(left) ? ExtendsRecord(inferred, RecordPattern2(left), RecordValue3(left), right) : IsString6(left) ? ExtendsString(inferred, left, right) : IsSymbol5(left) ? ExtendsSymbol(inferred, left, right) : IsTemplateLiteral3(left) ? ExtendsTemplateLiteral(inferred, left.pattern, right) : IsTuple3(left) ? ExtendsTuple(inferred, left.items, right) : IsUndefined6(left) ? ExtendsUndefined(inferred, left, right) : IsUnion3(left) ? ExtendsUnion2(inferred, left.anyOf, right) : IsUnknown3(left) ? ExtendsUnknown(inferred, left, right) : IsVoid3(left) ? ExtendsVoid(inferred, left, right) : ExtendsFalse();
}

// node_modules/typebox/build/type/engine/interface/instantiate.mjs
function InterfaceOperation(heritage, properties4) {
  const result = EvaluateIntersect([...heritage, _Object_(properties4)]);
  return result;
}
function InterfaceAction(heritage, properties4, options) {
  const result = CanInstantiate(heritage) ? exports_memory.Update(InterfaceOperation(heritage, properties4), {}, options) : InterfaceDeferred(heritage, properties4, options);
  return result;
}
function InterfaceInstantiate(context, state, heritage, properties4, options) {
  const instantiatedHeritage = InstantiateTypes(context, state, heritage);
  const instantiatedProperties = InstantiateProperties(context, state, properties4);
  return InterfaceAction(instantiatedHeritage, instantiatedProperties, options);
}

// node_modules/typebox/build/type/action/interface.mjs
function InterfaceDeferred(heritage, properties4, options = {}) {
  return Deferred("Interface", [heritage, properties4], options);
}
function IsInterfaceDeferred(value2) {
  return IsSchema4(value2) && exports_guard.HasPropertyKey(value2, "action") && exports_guard.IsEqual(value2.action, "Interface");
}

// node_modules/typebox/build/type/engine/cyclic/check.mjs
function FromRef5(stack, context, ref7) {
  return stack.includes(ref7) ? true : FromType5([...stack, ref7], context, context[ref7]);
}
function FromProperties20(stack, context, properties4) {
  const types2 = PropertyValues(properties4);
  return FromTypes4(stack, context, types2);
}
function FromTypes4(stack, context, types2) {
  return exports_guard.ShiftLeft(types2, (left, right) => FromType5(stack, context, left) ? true : FromTypes4(stack, context, right), () => false);
}
function FromType5(stack, context, type6) {
  return IsRef4(type6) ? FromRef5(stack, context, type6.$ref) : IsArray6(type6) ? FromType5(stack, context, type6.items) : IsConstructor4(type6) ? FromTypes4(stack, context, [...type6.parameters, type6.instanceType]) : IsFunction5(type6) ? FromTypes4(stack, context, [...type6.parameters, type6.returnType]) : IsInterfaceDeferred(type6) ? FromProperties20(stack, context, type6.parameters[1]) : IsIntersect3(type6) ? FromTypes4(stack, context, type6.allOf) : IsObject6(type6) ? FromProperties20(stack, context, type6.properties) : IsUnion3(type6) ? FromTypes4(stack, context, type6.anyOf) : IsTuple3(type6) ? FromTypes4(stack, context, type6.items) : IsRecord3(type6) ? FromType5(stack, context, RecordValue3(type6)) : false;
}
function CyclicCheck(stack, context, type6) {
  const result = FromType5(stack, context, type6);
  return result;
}

// node_modules/typebox/build/type/engine/cyclic/candidates.mjs
function ResolveCandidateKeys(context, keys) {
  return keys.reduce((result, left) => {
    return CyclicCheck([left], context, context[left]) ? [...result, left] : result;
  }, []);
}
function CyclicCandidates(context) {
  const keys = PropertyKeys(context);
  const result = ResolveCandidateKeys(context, keys);
  return result;
}
// node_modules/typebox/build/type/engine/cyclic/dependencies.mjs
function FromRef6(context, ref7, result) {
  return result.includes(ref7) ? result : (ref7 in context) ? FromType6(context, context[ref7], [...result, ref7]) : Unreachable();
}
function FromProperties21(context, properties4, result) {
  const types2 = PropertyValues(properties4);
  return FromTypes5(context, types2, result);
}
function FromTypes5(context, types2, result) {
  return types2.reduce((result2, left) => {
    return FromType6(context, left, result2);
  }, result);
}
function FromType6(context, type6, result) {
  return IsRef4(type6) ? FromRef6(context, type6.$ref, result) : IsArray6(type6) ? FromType6(context, type6.items, result) : IsConstructor4(type6) ? FromTypes5(context, [...type6.parameters, type6.instanceType], result) : IsFunction5(type6) ? FromTypes5(context, [...type6.parameters, type6.returnType], result) : IsInterfaceDeferred(type6) ? FromProperties21(context, type6.parameters[1], result) : IsIntersect3(type6) ? FromTypes5(context, type6.allOf, result) : IsObject6(type6) ? FromProperties21(context, type6.properties, result) : IsUnion3(type6) ? FromTypes5(context, type6.anyOf, result) : IsTuple3(type6) ? FromTypes5(context, type6.items, result) : IsRecord3(type6) ? FromType6(context, RecordValue3(type6), result) : result;
}
function CyclicDependencies(context, key, type6) {
  const result = FromType6(context, type6, [key]);
  return result;
}
// node_modules/typebox/build/type/engine/cyclic/extends.mjs
function FromRef7(_ref) {
  return Any2();
}
function FromProperties22(properties4) {
  return exports_guard.Keys(properties4).reduce((result, key) => {
    return { ...result, [key]: FromType7(properties4[key]) };
  }, {});
}
function FromTypes6(types2) {
  return types2.reduce((result, left) => {
    return [...result, FromType7(left)];
  }, []);
}
function FromType7(type6) {
  return IsRef4(type6) ? FromRef7(type6.$ref) : IsArray6(type6) ? _Array_(FromType7(type6.items), ArrayOptions(type6)) : IsConstructor4(type6) ? Constructor2(FromTypes6(type6.parameters), FromType7(type6.instanceType)) : IsFunction5(type6) ? _Function_(FromTypes6(type6.parameters), FromType7(type6.returnType)) : IsIntersect3(type6) ? Intersect2(FromTypes6(type6.allOf)) : IsObject6(type6) ? _Object_(FromProperties22(type6.properties)) : IsRecord3(type6) ? Record2(RecordKey3(type6), FromType7(RecordValue3(type6))) : IsUnion3(type6) ? Union2(FromTypes6(type6.anyOf)) : IsTuple3(type6) ? Tuple2(FromTypes6(type6.items)) : type6;
}
function CyclicAnyFromParameters(defs2, ref7) {
  return ref7 in defs2 ? FromType7(defs2[ref7]) : Unknown2();
}
function CyclicExtends(type6) {
  return CyclicAnyFromParameters(type6.$defs, type6.$ref);
}
// node_modules/typebox/build/type/engine/cyclic/instantiate.mjs
function CyclicInterface(context, heritage, properties4) {
  const instantiatedHeritage = InstantiateTypes(context, State([], []), heritage);
  const instantiatedProperties = InstantiateProperties({}, State([], []), properties4);
  const evaluatedInterface = EvaluateIntersect([...instantiatedHeritage, _Object_(instantiatedProperties)]);
  return evaluatedInterface;
}
function CyclicDefinitions(context, dependencies3) {
  const keys = exports_guard.Keys(context).filter((key) => dependencies3.includes(key));
  return keys.reduce((result, key) => {
    const type6 = context[key];
    const instantiatedType = IsInterfaceDeferred(type6) ? CyclicInterface(context, type6.parameters[0], type6.parameters[1]) : type6;
    return { ...result, [key]: instantiatedType };
  }, {});
}
function InstantiateCyclic(context, ref7, type6) {
  const dependencies3 = CyclicDependencies(context, ref7, type6);
  const definitions = CyclicDefinitions(context, dependencies3);
  const result = Cyclic(definitions, ref7);
  return result;
}
// node_modules/typebox/build/type/engine/cyclic/target.mjs
function Resolve(defs2, ref7) {
  return ref7 in defs2 ? IsRef4(defs2[ref7]) ? Resolve(defs2, defs2[ref7].$ref) : defs2[ref7] : Never2();
}
function CyclicTarget(defs2, ref7) {
  const result = Resolve(defs2, ref7);
  return result;
}
// node_modules/typebox/build/type/extends/extends.mjs
function Canonical(type6) {
  return IsCyclic(type6) ? CyclicExtends(type6) : IsUnsafe3(type6) ? Unknown2() : type6;
}
function Extends2(inferred, left, right) {
  const canonicalLeft = Canonical(left);
  const canonicalRight = Canonical(right);
  return ExtendsLeft(inferred, canonicalLeft, canonicalRight);
}
// node_modules/typebox/build/type/engine/evaluate/compare.mjs
var ResultEqual = "equal";
var ResultDisjoint = "disjoint";
var ResultLeftInside = "left-inside";
var ResultRightInside = "right-inside";
function Compare(left, right) {
  const extendsCheck = [
    IsUnknown3(left) ? exports_result.ExtendsFalse() : Extends2({}, left, right),
    IsUnknown3(left) ? exports_result.ExtendsTrue({}) : Extends2({}, right, left)
  ];
  return exports_result.IsExtendsTrueLike(extendsCheck[0]) && exports_result.IsExtendsTrueLike(extendsCheck[1]) ? ResultEqual : exports_result.IsExtendsTrueLike(extendsCheck[0]) && exports_result.IsExtendsFalse(extendsCheck[1]) ? ResultLeftInside : exports_result.IsExtendsFalse(extendsCheck[0]) && exports_result.IsExtendsTrueLike(extendsCheck[1]) ? ResultRightInside : ResultDisjoint;
}

// node_modules/typebox/build/type/engine/evaluate/broaden.mjs
function BroadFilter(type6, types2) {
  return types2.filter((left) => {
    return Compare(type6, left) === ResultRightInside ? false : true;
  });
}
function IsBroadestType(type6, types2) {
  const result = types2.some((left) => {
    const result2 = Compare(type6, left);
    return exports_guard.IsEqual(result2, ResultLeftInside) || exports_guard.IsEqual(result2, ResultEqual);
  });
  return exports_guard.IsEqual(result, false);
}
function BroadenType(type6, types2) {
  const evaluated = EvaluateType(type6);
  return IsAny3(evaluated) ? [evaluated] : IsBroadestType(evaluated, types2) ? [...BroadFilter(evaluated, types2), evaluated] : types2;
}
function BroadenTypes(types2) {
  return types2.reduce((result, left) => {
    return IsObject6(left) ? [...result, left] : IsNever3(left) ? result : BroadenType(left, result);
  }, []);
}
function Broaden(types2) {
  const broadened = BroadenTypes(types2);
  const flattened = Flatten(broadened);
  return flattened;
}
// node_modules/typebox/build/type/engine/evaluate/instantiate.mjs
function EvaluateAction(type6, options) {
  const result = exports_memory.Update(EvaluateType(type6), {}, options);
  return result;
}
function EvaluateInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return EvaluateAction(instantiatedType, options);
}
// node_modules/typebox/build/type/engine/call/distribute_arguments.mjs
function CollectDistributionNames(expression, result = []) {
  return IsDeferred(expression) && exports_guard.IsEqual(expression.action, "Conditional") ? IsRef4(expression.parameters[0]) ? CollectDistributionNames(expression.parameters[2], CollectDistributionNames(expression.parameters[3], [...result, expression.parameters[0]["$ref"]])) : CollectDistributionNames(expression.parameters[2], CollectDistributionNames(expression.parameters[3], result)) : IsDeferred(expression) && exports_guard.IsEqual(expression.action, "Mapped") ? IsDeferred(expression.parameters[1]) && exports_guard.IsEqual(expression.parameters[1].action, "KeyOf") && IsRef4(expression.parameters[1].parameters[0]) ? [...result, expression.parameters[1].parameters[0]["$ref"]] : result : result;
}
function BuildDistributionArray(parameters3, names2) {
  return parameters3.reduce((result, left) => [...result, names2.includes(left.name)], []);
}
function ZipDistributionArray(arguments_, distributionArray, result = []) {
  return exports_guard.ShiftLeft(arguments_, (argumentLeft, argumentRight) => exports_guard.ShiftLeft(distributionArray, (booleanLeft, booleanRight) => ZipDistributionArray(argumentRight, booleanRight, [...result, [booleanLeft, argumentLeft]]), () => result), () => result);
}
function Expand(type6) {
  return IsUnion3(type6) ? [...type6.anyOf] : [type6];
}
function Append(current, type6) {
  return current.reduce((result, left) => [...result, [...left, type6]], []);
}
function Cross(current, variants) {
  return variants.reduce((result, left) => {
    return [...result, ...Append(current, left)];
  }, []);
}
function Distribute2(zipped) {
  return zipped.reduce((result, left) => {
    return exports_guard.IsEqual(left[0], true) ? Cross(result, Expand(left[1])) : Cross(result, [left[1]]);
  }, [[]]);
}
function DistributeArguments(parameters3, arguments_, expression) {
  const distributionNames = CollectDistributionNames(expression);
  const distributionArray = BuildDistributionArray(parameters3, distributionNames);
  const zippedArguments = ZipDistributionArray(arguments_, distributionArray);
  return IsDeferred(expression) && exports_guard.IsEqual(expression.action, "Conditional") ? Distribute2(zippedArguments) : IsDeferred(expression) && exports_guard.IsEqual(expression.action, "Mapped") ? Distribute2(zippedArguments) : [arguments_];
}

// node_modules/typebox/build/type/engine/call/resolve_target.mjs
function FromNotResolvable() {
  return ["(not-resolvable)", Never2()];
}
function FromNotGeneric() {
  return ["(not-generic)", Never2()];
}
function FromGeneric(name, parameters3, expression) {
  return [name, Generic(parameters3, expression)];
}
function FromRef8(context, ref7, arguments_) {
  return ref7 in context ? FromType8(context, ref7, context[ref7], arguments_) : FromNotResolvable();
}
function FromType8(context, name, target2, arguments_) {
  return IsGeneric(target2) ? FromGeneric(name, target2.parameters, target2.expression) : IsRef4(target2) ? FromRef8(context, target2.$ref, arguments_) : FromNotGeneric();
}
function ResolveTarget(context, target2, arguments_) {
  return FromType8(context, "(anonymous)", target2, arguments_);
}

// node_modules/typebox/build/type/engine/call/resolve_arguments.mjs
function AssertArgumentExtends(name, type6, extends_) {
  if (IsInfer(type6) || IsCall(type6) || exports_result.IsExtendsTrueLike(Extends2({}, type6, extends_)))
    return;
  const cause = { parameter: name, expect: extends_, actual: type6 };
  throw new Error(`Argument for parameter ${name} does not satisfy constraint`, { cause });
}
function BindArgument(context, state, name, extends_, type6) {
  const instantiatedArgument = InstantiateType(context, state, type6);
  AssertArgumentExtends(name, instantiatedArgument, extends_);
  return exports_memory.Assign(context, { [name]: instantiatedArgument });
}
function BindArguments(context, state, parameterLeft, parameterRight, arguments_) {
  const instantiatedExtends = InstantiateType(context, state, parameterLeft.extends);
  const instantiatedEquals = InstantiateType(context, state, parameterLeft.equals);
  return exports_guard.ShiftLeft(arguments_, (left, right) => BindParameters(BindArgument(context, state, parameterLeft["name"], instantiatedExtends, left), state, parameterRight, right), () => BindParameters(BindArgument(context, state, parameterLeft["name"], instantiatedExtends, instantiatedEquals), state, parameterRight, []));
}
function BindParameters(context, state, parameters3, arguments_) {
  return exports_guard.ShiftLeft(parameters3, (left, right) => BindArguments(context, state, left, right, arguments_), () => context);
}
function ResolveArgumentsContext(context, state, parameters3, arguments_) {
  return BindParameters(context, state, parameters3, arguments_);
}

// node_modules/typebox/build/type/engine/call/instantiate.mjs
function Peek(state) {
  const result = exports_guard.IsGreaterThan(state.callstack.length, 0) ? state.callstack[state.callstack.length - 1] : "";
  return result;
}
function IsTailCall(state, name) {
  const result = exports_guard.IsEqual(Peek(state), name);
  return result;
}
function CallDispatch(context, state, target2, parameters3, expression, arguments_) {
  const argumentsContext = ResolveArgumentsContext(context, state, parameters3, arguments_);
  const returnType = InstantiateType(argumentsContext, State([...state["callstack"], target2["$ref"]], state["visited"]), expression);
  return InstantiateType(argumentsContext, State([], []), returnType);
}
function CallDistributed(context, state, target2, parameters3, expression, distributedArguments) {
  return distributedArguments.reduce((result, arguments_) => [...result, CallDispatch(context, state, target2, parameters3, expression, arguments_)], []);
}
function CallImmediate(context, state, target2, parameters3, expression, arguments_) {
  const distributedArguments = DistributeArguments(parameters3, arguments_, expression);
  const returnTypes = CallDistributed(context, state, target2, parameters3, expression, distributedArguments);
  const result = exports_guard.IsEqual(returnTypes.length, 1) ? returnTypes[0] : EvaluateUnion(returnTypes);
  return result;
}
function CallInstantiate(context, state, target2, arguments_) {
  const instantiatedArguments = InstantiateTypes(context, state, arguments_);
  const resolved = ResolveTarget(context, target2, arguments_);
  const name = resolved[0];
  const type6 = resolved[1];
  const result = IsGeneric(type6) ? IsTailCall(state, name) ? CallConstruct(Ref3(name), instantiatedArguments) : CallImmediate(context, state, Ref3(name), type6.parameters, type6.expression, instantiatedArguments) : CallConstruct(target2, instantiatedArguments);
  return result;
}

// node_modules/typebox/build/type/types/call.mjs
function CallConstruct(target2, arguments_) {
  return exports_memory.Create({ ["~kind"]: "Call" }, { type: "call", target: target2, arguments: arguments_ }, {});
}
function IsCall(value2) {
  return IsKind3(value2, "Call");
}

// node_modules/typebox/build/type/engine/immutable/instantiate_remove.mjs
function RemoveImmutableOperation(type6) {
  return exports_memory.Discard(type6, ["~immutable"]);
}
function RemoveImmutableAction(type6, options) {
  const result = exports_memory.Update(RemoveImmutableOperation(type6), {}, options);
  return result;
}
function RemoveImmutableInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return RemoveImmutableAction(instantiatedType, options);
}

// node_modules/typebox/build/type/engine/intrinsics/mapping.mjs
function ApplyMapping(mapping, value2) {
  return mapping(value2);
}

// node_modules/typebox/build/type/engine/intrinsics/from_literal.mjs
function FromLiteral5(mapping, value2) {
  return exports_guard.IsString(value2) ? Literal2(ApplyMapping(mapping, value2)) : Literal2(value2);
}

// node_modules/typebox/build/type/engine/intrinsics/from_template_literal.mjs
function FromTemplateLiteral4(mapping, pattern4) {
  const evaluated = EvaluateTemplateLiteral(pattern4);
  const result = FromType9(mapping, evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/intrinsics/from_union.mjs
function FromUnion12(mapping, types2) {
  const result = types2.map((type6) => FromType9(mapping, type6));
  return Union2(result);
}

// node_modules/typebox/build/type/engine/intrinsics/from_type.mjs
function FromType9(mapping, type6) {
  return IsLiteral3(type6) ? FromLiteral5(mapping, type6.const) : IsTemplateLiteral3(type6) ? FromTemplateLiteral4(mapping, type6.pattern) : IsUnion3(type6) ? FromUnion12(mapping, type6.anyOf) : type6;
}

// node_modules/typebox/build/type/action/capitalize.mjs
function CapitalizeDeferred(type6, options = {}) {
  return Deferred("Capitalize", [type6], options);
}

// node_modules/typebox/build/type/action/lowercase.mjs
function LowercaseDeferred(type6, options = {}) {
  return Deferred("Lowercase", [type6], options);
}

// node_modules/typebox/build/type/action/uncapitalize.mjs
function UncapitalizeDeferred(type6, options = {}) {
  return Deferred("Uncapitalize", [type6], options);
}

// node_modules/typebox/build/type/action/uppercase.mjs
function UppercaseDeferred(type6, options = {}) {
  return Deferred("Uppercase", [type6], options);
}

// node_modules/typebox/build/type/engine/intrinsics/instantiate.mjs
var CapitalizeMapping = (input) => input[0].toUpperCase() + input.slice(1);
var LowercaseMapping = (input) => input.toLowerCase();
var UncapitalizeMapping = (input) => input[0].toLowerCase() + input.slice(1);
var UppercaseMapping = (input) => input.toUpperCase();
function CapitalizeAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(FromType9(CapitalizeMapping, type6), {}, options) : CapitalizeDeferred(type6, options);
  return result;
}
function LowercaseAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(FromType9(LowercaseMapping, type6), {}, options) : LowercaseDeferred(type6, options);
  return result;
}
function UncapitalizeAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(FromType9(UncapitalizeMapping, type6), {}, options) : UncapitalizeDeferred(type6, options);
  return result;
}
function UppercaseAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(FromType9(UppercaseMapping, type6), {}, options) : UppercaseDeferred(type6, options);
  return result;
}
function CapitalizeInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return CapitalizeAction(instantiatedType, options);
}
function LowercaseInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return LowercaseAction(instantiatedType, options);
}
function UncapitalizeInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return UncapitalizeAction(instantiatedType, options);
}
function UppercaseInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return UppercaseAction(instantiatedType, options);
}

// node_modules/typebox/build/type/action/conditional.mjs
function ConditionalDeferred(left, right, true_, false_, options = {}) {
  return Deferred("Conditional", [left, right, true_, false_], options);
}

// node_modules/typebox/build/type/engine/conditional/instantiate.mjs
function ConditionalOperation(context, state, left, right, true_, false_) {
  const extendsResult = Extends2(context, left, right);
  return exports_result.IsExtendsUnion(extendsResult) ? Union2([InstantiateType(extendsResult.inferred, state, true_), InstantiateType(context, state, false_)]) : exports_result.IsExtendsTrue(extendsResult) ? InstantiateType(extendsResult.inferred, state, true_) : InstantiateType(context, state, false_);
}
function ConditionalAction(context, state, left, right, true_, false_, options) {
  const result = CanInstantiate([left, right]) ? exports_memory.Update(ConditionalOperation(context, state, left, right, true_, false_), {}, options) : ConditionalDeferred(left, right, true_, false_, options);
  return result;
}
function ConditionalInstantiate(context, state, left, right, true_, false_, options) {
  const instantiatedLeft = InstantiateType(context, state, left);
  const instantiatedRight = InstantiateType(context, state, right);
  return ConditionalAction(context, state, instantiatedLeft, instantiatedRight, true_, false_, options);
}
// node_modules/typebox/build/type/action/constructor_parameters.mjs
function ConstructorParametersDeferred(type6, options = {}) {
  return Deferred("ConstructorParameters", [type6], options);
}

// node_modules/typebox/build/type/engine/constructor_parameters/instantiate.mjs
function ConstructorParametersOperation(type6) {
  const parameters3 = IsConstructor4(type6) ? type6["parameters"] : [];
  const instantiatedParameters = InstantiateElements({}, State([], []), parameters3);
  const result = Tuple2(instantiatedParameters);
  return result;
}
function ConstructorParametersAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(ConstructorParametersOperation(type6), {}, options) : ConstructorParametersDeferred(type6, options);
  return result;
}
function ConstructorParametersInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return ConstructorParametersAction(instantiatedType, options);
}

// node_modules/typebox/build/type/action/exclude.mjs
function ExcludeDeferred(left, right, options = {}) {
  return Deferred("Exclude", [left, right], options);
}

// node_modules/typebox/build/type/engine/exclude/instantiate.mjs
function ExcludeAction(left, right, options) {
  const result = CanInstantiate([left, right]) ? exports_memory.Update(ExcludeOperation(left, right), {}, options) : ExcludeDeferred(left, right, options);
  return result;
}
function ExcludeInstantiate(context, state, left, right, options) {
  const instantiatedLeft = InstantiateType(context, state, left);
  const instantiatedRight = InstantiateType(context, state, right);
  return ExcludeAction(instantiatedLeft, instantiatedRight, options);
}

// node_modules/typebox/build/type/action/extract.mjs
function ExtractDeferred(left, right, options = {}) {
  return Deferred("Extract", [left, right], options);
}

// node_modules/typebox/build/type/engine/extract/operation.mjs
function ExtractType(left, right) {
  const check4 = Extends2({}, left, right);
  const result = exports_result.IsExtendsTrueLike(check4) ? [left] : [];
  return result;
}
function ExtractUnion(types2, right) {
  return types2.reduce((result, head) => {
    return [...result, ...ExtractType(head, right)];
  }, []);
}
function ExtractOperation(left, right) {
  const evaluated = EvaluateType(left);
  const canonical = IsUnion3(evaluated) ? evaluated.anyOf : [evaluated];
  const remaining = ExtractUnion(canonical, right);
  const result = EvaluateUnion(remaining);
  return result;
}

// node_modules/typebox/build/type/engine/extract/instantiate.mjs
function ExtractAction(left, right, options) {
  const result = CanInstantiate([left, right]) ? exports_memory.Update(ExtractOperation(left, right), {}, options) : ExtractDeferred(left, right, options);
  return result;
}
function ExtractInstantiate(context, state, left, right, options) {
  const instantiatedLeft = InstantiateType(context, state, left);
  const instantiatedRight = InstantiateType(context, state, right);
  return ExtractAction(instantiatedLeft, instantiatedRight, options);
}

// node_modules/typebox/build/type/action/indexed.mjs
function IndexDeferred(type6, indexer, options = {}) {
  return Deferred("Index", [type6, indexer], options);
}

// node_modules/typebox/build/type/engine/object/from_cyclic.mjs
function FromCyclic(defs2, ref7) {
  const target2 = CyclicTarget(defs2, ref7);
  const result = FromType10(target2);
  return result;
}

// node_modules/typebox/build/type/engine/object/from_dependent.mjs
function FromDependent(if_, then_, else_) {
  const evaluated = EvaluateDependent(if_, then_, else_);
  const result = FromType10(evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/object/from_intersect.mjs
function CollapseIntersectProperties(left, right) {
  const leftKeys = exports_guard.Keys(left).filter((key) => !exports_guard.HasPropertyKey(right, key));
  const rightKeys = exports_guard.Keys(right).filter((key) => !exports_guard.HasPropertyKey(left, key));
  const sharedKeys = exports_guard.Keys(left).filter((key) => exports_guard.HasPropertyKey(right, key));
  const leftProperties = leftKeys.reduce((result, key) => ({ ...result, [key]: left[key] }), {});
  const rightProperties = rightKeys.reduce((result, key) => ({ ...result, [key]: right[key] }), {});
  const sharedProperties = sharedKeys.reduce((result, key) => ({ ...result, [key]: EvaluateIntersect([left[key], right[key]]) }), {});
  const unique = exports_memory.Assign(leftProperties, rightProperties);
  const shared = exports_memory.Assign(unique, sharedProperties);
  return shared;
}
function FromIntersect9(types2) {
  return types2.reduce((result, left) => {
    return CollapseIntersectProperties(result, FromType10(left));
  }, {});
}

// node_modules/typebox/build/type/engine/object/from_object.mjs
function FromObject12(properties4) {
  return properties4;
}

// node_modules/typebox/build/type/engine/object/from_tuple.mjs
function FromTuple6(types2) {
  const object4 = TupleToObject(Tuple2(types2));
  const result = FromType10(object4);
  return result;
}

// node_modules/typebox/build/type/engine/object/from_union.mjs
function CollapseUnionProperties(left, right) {
  const sharedKeys = exports_guard.Keys(left).filter((key) => (key in right));
  const result = sharedKeys.reduce((result2, key) => {
    return { ...result2, [key]: EvaluateUnion([left[key], right[key]]) };
  }, {});
  return result;
}
function ReduceVariants(types2, result) {
  return exports_guard.ShiftLeft(types2, (left, right) => ReduceVariants(right, CollapseUnionProperties(result, FromType10(left))), () => result);
}
function FromUnion13(types2) {
  return exports_guard.ShiftLeft(types2, (left, right) => ReduceVariants(right, FromType10(left)), () => Unreachable());
}

// node_modules/typebox/build/type/engine/object/from_type.mjs
function FromType10(type6) {
  return IsCyclic(type6) ? FromCyclic(type6.$defs, type6.$ref) : IsDependent(type6) ? FromDependent(type6.if, type6.then, type6.else) : IsIntersect3(type6) ? FromIntersect9(type6.allOf) : IsUnion3(type6) ? FromUnion13(type6.anyOf) : IsTuple3(type6) ? FromTuple6(type6.items) : IsObject6(type6) ? FromObject12(type6.properties) : {};
}

// node_modules/typebox/build/type/engine/object/collapse.mjs
function CollapseToObject(type6) {
  const properties4 = FromType10(type6);
  const result = _Object_(properties4);
  return result;
}
// node_modules/typebox/build/type/engine/helpers/keys.mjs
var integerKeyPattern = new RegExp("^(?:0|[1-9][0-9]*)$");
function ConvertToIntegerKey(value2) {
  const normal = `${value2}`;
  return integerKeyPattern.test(normal) ? parseInt(normal) : value2;
}

// node_modules/typebox/build/type/engine/indexed/from_array.mjs
function NormalizeLiteral(value2) {
  return Literal2(ConvertToIntegerKey(value2));
}
function NormalizeIndexerTypes(types2) {
  return types2.map((type6) => NormalizeIndexer(type6));
}
function NormalizeIndexer(type6) {
  return IsIntersect3(type6) ? Intersect2(NormalizeIndexerTypes(type6.allOf)) : IsUnion3(type6) ? Union2(NormalizeIndexerTypes(type6.anyOf)) : IsLiteral3(type6) ? NormalizeLiteral(type6.const) : type6;
}
function FromArray10(type6, indexer) {
  const normalizedIndexer = NormalizeIndexer(indexer);
  const check4 = Extends2({}, normalizedIndexer, Number3());
  const result = exports_result.IsExtendsTrueLike(check4) ? type6 : IsLiteral3(indexer) && exports_guard.IsEqual(indexer.const, "length") ? Number3() : Never2();
  return result;
}

// node_modules/typebox/build/type/engine/indexable/from_cyclic.mjs
function FromCyclic2(defs2, ref7) {
  const target2 = CyclicTarget(defs2, ref7);
  const result = FromType11(target2);
  return result;
}

// node_modules/typebox/build/type/engine/indexable/from_dependent.mjs
function FromDependent2(if_, then_, else_) {
  const evaluated = EvaluateDependent(if_, then_, else_);
  const result = FromType11(evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/indexable/from_enum.mjs
function FromEnum(values) {
  const evaluated = EvaluateEnum(values);
  const result = FromType11(evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/indexable/from_intersect.mjs
function FromIntersect10(types2) {
  const evaluated = EvaluateIntersect(types2);
  const result = FromType11(evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/indexable/from_literal.mjs
function FromLiteral6(value2) {
  const result = [`${value2}`];
  return result;
}

// node_modules/typebox/build/type/engine/indexable/from_template_literal.mjs
function FromTemplateLiteral5(pattern4) {
  const evaluated = EvaluateTemplateLiteral(pattern4);
  const result = FromType11(evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/indexable/from_union.mjs
function FromUnion14(types2) {
  return types2.reduce((result, left) => {
    return [...result, ...FromType11(left)];
  }, []);
}

// node_modules/typebox/build/type/engine/indexable/from_type.mjs
function FromType11(type6) {
  return IsCyclic(type6) ? FromCyclic2(type6.$defs, type6.$ref) : IsDependent(type6) ? FromDependent2(type6.if, type6.then, type6.else) : IsEnum2(type6) ? FromEnum(type6.enum) : IsIntersect3(type6) ? FromIntersect10(type6.allOf) : IsLiteral3(type6) ? FromLiteral6(type6.const) : IsTemplateLiteral3(type6) ? FromTemplateLiteral5(type6.pattern) : IsUnion3(type6) ? FromUnion14(type6.anyOf) : [];
}

// node_modules/typebox/build/type/engine/indexable/to_indexable_keys.mjs
function ToIndexableKeys(type6) {
  const result = FromType11(type6);
  return result;
}

// node_modules/typebox/build/type/engine/this/expand_this.mjs
function FromTypes7(properties4, types2) {
  return types2.map((type6) => FromType12(properties4, type6));
}
function FromType12(properties4, type6) {
  return IsArray6(type6) ? _Array_(FromType12(properties4, type6.items)) : IsConstructor4(type6) ? Constructor2(FromTypes7(properties4, type6.parameters), FromType12(properties4, type6.instanceType)) : IsFunction5(type6) ? _Function_(FromTypes7(properties4, type6.parameters), FromType12(properties4, type6.returnType)) : IsTuple3(type6) ? Tuple2(FromTypes7(properties4, type6.items)) : IsUnion3(type6) ? Union2(FromTypes7(properties4, type6.anyOf)) : IsIntersect3(type6) ? Intersect2(FromTypes7(properties4, type6.allOf)) : IsThis3(type6) ? _Object_(properties4) : type6;
}
function ExpandThis(properties4, type6) {
  const result = FromType12(properties4, type6);
  return result;
}

// node_modules/typebox/build/type/engine/indexed/from_object.mjs
function IndexProperty(properties4, key) {
  const selectedType = key in properties4 ? properties4[key] : Never2();
  const result = ExpandThis(properties4, selectedType);
  return result;
}
function IndexProperties(properties4, keys) {
  return keys.reduce((result, left) => {
    return [...result, IndexProperty(properties4, left)];
  }, []);
}
function FromIndexer(properties4, indexer) {
  const keys = ToIndexableKeys(indexer);
  const variants = IndexProperties(properties4, keys);
  const result = EvaluateUnion(variants);
  return result;
}
var NumericKeyPattern = new RegExp(IntegerKey);
function NumericKeys(keys) {
  const result = keys.filter((key) => NumericKeyPattern.test(key));
  return result;
}
function FromIndexerNumber(properties4) {
  const keys = PropertyKeys(properties4);
  const numericKeys = NumericKeys(keys);
  const variants = IndexProperties(properties4, numericKeys);
  const result = EvaluateUnion(variants);
  return result;
}
function FromObject13(properties4, indexer) {
  const result = IsNumber7(indexer) ? FromIndexerNumber(properties4) : FromIndexer(properties4, indexer);
  return result;
}

// node_modules/typebox/build/type/engine/indexed/array_indexer.mjs
function ConvertLiteral(value2) {
  return Literal2(ConvertToIntegerKey(value2));
}
function ArrayIndexerTypes(types2) {
  return types2.map((type6) => FormatArrayIndexer(type6));
}
function FormatArrayIndexer(type6) {
  return IsIntersect3(type6) ? Intersect2(ArrayIndexerTypes(type6.allOf)) : IsUnion3(type6) ? Union2(ArrayIndexerTypes(type6.anyOf)) : IsLiteral3(type6) ? ConvertLiteral(type6.const) : type6;
}

// node_modules/typebox/build/type/engine/indexed/from_tuple.mjs
function IndexElementsWithIndexer(types2, indexer) {
  return types2.reduceRight((result, right, index) => {
    const check4 = Extends2({}, Literal2(index), indexer);
    return exports_result.IsExtendsTrueLike(check4) ? [right, ...result] : result;
  }, []);
}
function FromTupleWithIndexer(types2, indexer) {
  const formattedArrayIndexer = FormatArrayIndexer(indexer);
  const elements = IndexElementsWithIndexer(types2, formattedArrayIndexer);
  return EvaluateUnionFast(elements);
}
function FromTupleWithoutIndexer(types2) {
  return EvaluateUnionFast(types2);
}
function FromTuple7(types2, indexer) {
  return IsLiteral3(indexer) && exports_guard.IsEqual(indexer.const, "length") ? Literal2(types2.length) : IsNumber7(indexer) || IsInteger4(indexer) ? FromTupleWithoutIndexer(types2) : FromTupleWithIndexer(types2, indexer);
}

// node_modules/typebox/build/type/engine/indexed/from_type.mjs
function FromType13(type6, indexer) {
  return IsArray6(type6) ? FromArray10(type6.items, indexer) : IsObject6(type6) ? FromObject13(type6.properties, indexer) : IsTuple3(type6) ? FromTuple7(type6.items, indexer) : Never2();
}

// node_modules/typebox/build/type/engine/indexed/instantiate.mjs
function NormalizeType(type6) {
  const result = IsCyclic(type6) || IsDependent(type6) || IsIntersect3(type6) || IsUnion3(type6) ? CollapseToObject(type6) : type6;
  return result;
}
function IndexAction(type6, indexer, options) {
  const result = CanInstantiate([type6, indexer]) ? exports_memory.Update(FromType13(NormalizeType(type6), indexer), {}, options) : IndexDeferred(type6, indexer, options);
  return result;
}
function IndexInstantiate(context, state, type6, indexer, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  const instantiatedIndexer = InstantiateType(context, state, indexer);
  return IndexAction(instantiatedType, instantiatedIndexer, options);
}

// node_modules/typebox/build/type/action/instance_type.mjs
function InstanceTypeDeferred(type6, options = {}) {
  return Deferred("InstanceType", [type6], options);
}

// node_modules/typebox/build/type/engine/instance_type/instantiate.mjs
function InstanceTypeOperation(type6) {
  return IsConstructor4(type6) ? type6["instanceType"] : Never2();
}
function InstanceTypeAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(InstanceTypeOperation(type6), {}, options) : InstanceTypeDeferred(type6, options);
  return result;
}
function InstanceTypeInstantiate(context, state, type6, options = {}) {
  const instantiatedType = InstantiateType(context, state, type6);
  return InstanceTypeAction(instantiatedType, options);
}

// node_modules/typebox/build/type/action/keyof.mjs
function KeyOfDeferred(type6, options = {}) {
  return Deferred("KeyOf", [type6], options);
}

// node_modules/typebox/build/type/engine/keyof/from_any.mjs
function FromAny2() {
  return Union2([Number3(), String3(), Symbol3()]);
}

// node_modules/typebox/build/type/engine/keyof/from_array.mjs
function FromArray11(_type) {
  return Number3();
}

// node_modules/typebox/build/type/engine/keyof/from_object.mjs
function FromPropertyKeys4(keys) {
  const result = keys.reduce((result2, left) => {
    return IsLiteralValue3(left) ? [...result2, Literal2(ConvertToIntegerKey(left))] : Unreachable();
  }, []);
  return result;
}
function FromObject14(properties4) {
  const propertyKeys = exports_guard.Keys(properties4);
  const variants = FromPropertyKeys4(propertyKeys);
  const result = EvaluateUnionFast(variants);
  return result;
}

// node_modules/typebox/build/type/engine/keyof/from_record.mjs
function FromRecord5(type6) {
  return RecordKey3(type6);
}

// node_modules/typebox/build/type/engine/keyof/from_tuple.mjs
function FromTuple8(types2) {
  const result = types2.map((_2, index) => Literal2(index));
  return EvaluateUnionFast(result);
}

// node_modules/typebox/build/type/engine/keyof/from_type.mjs
function FromType14(type6) {
  return IsAny3(type6) ? FromAny2() : IsArray6(type6) ? FromArray11(type6.items) : IsObject6(type6) ? FromObject14(type6.properties) : IsRecord3(type6) ? FromRecord5(type6) : IsTuple3(type6) ? FromTuple8(type6.items) : Never2();
}

// node_modules/typebox/build/type/engine/keyof/instantiate.mjs
function NormalizeType2(type6) {
  const result = IsCyclic(type6) || IsDependent(type6) || IsIntersect3(type6) || IsUnion3(type6) ? CollapseToObject(type6) : type6;
  return result;
}
function KeyOfAction(type6, options) {
  return CanInstantiate([type6]) ? exports_memory.Update(FromType14(NormalizeType2(type6)), {}, options) : KeyOfDeferred(type6, options);
}
function KeyOfInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return KeyOfAction(instantiatedType, options);
}

// node_modules/typebox/build/type/action/mapped.mjs
function MappedDeferred(identifier2, type6, as, property, options = {}) {
  return Deferred("Mapped", [identifier2, type6, as, property], options);
}

// node_modules/typebox/build/type/engine/mapped/mapped_variants.mjs
function FromTemplateLiteral6(pattern4) {
  const evaluated = EvaluateTemplateLiteral(pattern4);
  const result = FromType15(evaluated);
  return result;
}
function FromUnion15(types2) {
  return types2.reduce((result, left) => {
    return [...result, ...FromType15(left)];
  }, []);
}
function FromEnum2(values) {
  const evaluated = EvaluateEnum(values);
  const result = FromType15(evaluated);
  return result;
}
function FromLiteral7(value2) {
  const result = exports_guard.IsNumber(value2) ? [Literal2(`${value2}`)] : [Literal2(value2)];
  return result;
}
function FromType15(type6) {
  const result = IsEnum2(type6) ? FromEnum2(type6.enum) : IsLiteral3(type6) ? FromLiteral7(type6.const) : IsTemplateLiteral3(type6) ? FromTemplateLiteral6(type6.pattern) : IsUnion3(type6) ? FromUnion15(type6.anyOf) : [type6];
  return result;
}
function MappedVariants(type6) {
  const result = FromType15(type6);
  return result;
}

// node_modules/typebox/build/type/engine/mapped/mapped_operation.mjs
function CanonicalAs(instantiatedAs) {
  const result = IsTemplateLiteral3(instantiatedAs) ? EvaluateTemplateLiteral(instantiatedAs.pattern) : instantiatedAs;
  return result;
}
function MappedVariant(context, state, identifier2, variant, as, property) {
  const variantContext = exports_memory.Assign(context, { [identifier2["name"]]: variant });
  const instantiatedAs = InstantiateType(variantContext, state, as);
  const canonicalAs = CanonicalAs(instantiatedAs);
  const instantiatedProperty = InstantiateType(variantContext, state, property);
  return IsLiteralNumber2(canonicalAs) || IsLiteralString2(canonicalAs) ? { [canonicalAs.const]: instantiatedProperty } : {};
}
function MappedProperties(context, state, identifier2, variants, as, property) {
  return variants.reduce((result, left) => {
    return [...result, MappedVariant(context, state, identifier2, left, as, property)];
  }, []);
}
function MappedObjects(properties4) {
  return properties4.reduce((result, left) => {
    return [...result, _Object_(left)];
  }, []);
}
function MappedOperation(context, state, identifier2, type6, as, property) {
  const variants = MappedVariants(type6);
  const mappedProperties = MappedProperties(context, state, identifier2, variants, as, property);
  const mappedObjects = MappedObjects(mappedProperties);
  const result = EvaluateIntersect(mappedObjects);
  return result;
}

// node_modules/typebox/build/type/engine/mapped/instantiate.mjs
function MappedAction(context, state, identifier2, type6, as, property, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(MappedOperation(context, state, identifier2, type6, as, property), {}, options) : MappedDeferred(identifier2, type6, as, property, options);
  return result;
}
function MappedInstantiate(context, state, identifier2, type6, as, property, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return MappedAction(context, state, identifier2, instantiatedType, as, property, options);
}

// node_modules/typebox/build/type/engine/module/instantiate.mjs
function InstantiateCyclics(context, declarations, cyclicKeys) {
  const declarationContext = exports_memory.Assign(context, declarations);
  const declarationKeys = exports_guard.Keys(declarations).filter((key) => cyclicKeys.includes(key));
  return declarationKeys.reduce((result, key) => {
    return { ...result, [key]: InstantiateCyclic(declarationContext, key, declarations[key]) };
  }, {});
}
function InstantiateNonCyclics(context, declarations, cyclicKeys) {
  const declarationContext = exports_memory.Assign(context, declarations);
  const declarationKeys = exports_guard.Keys(declarations).filter((key) => !cyclicKeys.includes(key));
  return declarationKeys.reduce((result, key) => {
    return { ...result, [key]: InstantiateType(declarationContext, State([], []), declarations[key]) };
  }, {});
}
function InstantiateModule(context, declarations, options) {
  const cyclicCandidates = CyclicCandidates(declarations);
  const instantiatedCyclics = InstantiateCyclics(context, declarations, cyclicCandidates);
  const instantiatedNonCyclics = InstantiateNonCyclics(context, declarations, cyclicCandidates);
  const instantiatedModule = { ...instantiatedCyclics, ...instantiatedNonCyclics };
  return exports_memory.Update(instantiatedModule, {}, options);
}
function ModuleInstantiate(context, _state, declarations, options) {
  const instantiatedModule = InstantiateModule(context, declarations, options);
  return instantiatedModule;
}

// node_modules/typebox/build/type/action/non_nullable.mjs
function NonNullableDeferred(type6, options = {}) {
  return Deferred("NonNullable", [type6], options);
}

// node_modules/typebox/build/type/engine/non_nullable/instantiate.mjs
function NonNullableOperation(type6) {
  const excluded = Union2([Null2(), Undefined2()]);
  return ExcludeAction(type6, excluded, {});
}
function NonNullableAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(NonNullableOperation(type6), {}, options) : NonNullableDeferred(type6, options);
  return result;
}
function NonNullableInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return NonNullableAction(instantiatedType, options);
}

// node_modules/typebox/build/type/action/omit.mjs
function OmitDeferred(type6, indexer, options = {}) {
  return Deferred("Omit", [type6, indexer], options);
}

// node_modules/typebox/build/type/engine/indexable/to_indexable.mjs
function ToIndexable(type6) {
  const collapsed = CollapseToObject(type6);
  const result = IsObject6(collapsed) ? collapsed.properties : Unreachable();
  return result;
}

// node_modules/typebox/build/type/engine/omit/from_type.mjs
function FromKeys(properties4, keys) {
  const result = exports_guard.Keys(properties4).reduce((result2, key) => {
    return keys.includes(key) ? result2 : { ...result2, [key]: properties4[key] };
  }, {});
  return result;
}
function FromType16(type6, indexer) {
  const indexable = ToIndexable(type6);
  const indexableKeys = ToIndexableKeys(indexer);
  const omitted = FromKeys(indexable, indexableKeys);
  const result = _Object_(omitted);
  return result;
}

// node_modules/typebox/build/type/engine/omit/instantiate.mjs
function OmitAction(type6, indexer, options) {
  const result = CanInstantiate([type6, indexer]) ? exports_memory.Update(FromType16(type6, indexer), {}, options) : OmitDeferred(type6, indexer, options);
  return result;
}
function OmitInstantiate(context, state, type6, indexer, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  const instantiatedIndexer = InstantiateType(context, state, indexer);
  return OmitAction(instantiatedType, instantiatedIndexer, options);
}

// node_modules/typebox/build/type/action/parameters.mjs
function ParametersDeferred(type6, options = {}) {
  return Deferred("Parameters", [type6], options);
}

// node_modules/typebox/build/type/engine/parameters/instantiate.mjs
function ParametersOperation(type6) {
  const parameters3 = IsFunction5(type6) ? type6["parameters"] : [];
  const instantiatedParameters = InstantiateElements({}, State([], []), parameters3);
  const result = Tuple2(instantiatedParameters);
  return result;
}
function ParametersAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(ParametersOperation(type6), {}, options) : ParametersDeferred(type6, options);
  return result;
}
function ParametersInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return ParametersAction(instantiatedType, options);
}

// node_modules/typebox/build/type/action/partial.mjs
function PartialDeferred(type6, options = {}) {
  return Deferred("Partial", [type6], options);
}

// node_modules/typebox/build/type/engine/partial/from_cyclic.mjs
function FromCyclic3(defs2, ref7) {
  const target2 = CyclicTarget(defs2, ref7);
  const partial3 = FromType17(target2);
  const result = Cyclic(exports_memory.Assign(defs2, { [ref7]: partial3 }), ref7);
  return result;
}

// node_modules/typebox/build/type/engine/partial/from_dependent.mjs
function FromDependent3(if_, then_, else_) {
  const evaluated = EvaluateDependent(if_, then_, else_);
  const result = FromType17(evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/partial/from_intersect.mjs
function FromIntersect11(types2) {
  const evaluated = EvaluateIntersect(types2);
  const result = FromType17(evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/partial/from_union.mjs
function FromUnion16(types2) {
  const result = types2.map((type6) => FromType17(type6));
  return Union2(result);
}

// node_modules/typebox/build/type/engine/partial/from_object.mjs
function FromObject15(properties4) {
  const mapped3 = exports_guard.Keys(properties4).reduce((result2, left) => {
    return { ...result2, [left]: AddOptional2(properties4[left]) };
  }, {});
  const result = _Object_(mapped3);
  return result;
}

// node_modules/typebox/build/type/engine/partial/from_type.mjs
function FromType17(type6) {
  return IsCyclic(type6) ? FromCyclic3(type6.$defs, type6.$ref) : IsDependent(type6) ? FromDependent3(type6.if, type6.then, type6.else) : IsIntersect3(type6) ? FromIntersect11(type6.allOf) : IsUnion3(type6) ? FromUnion16(type6.anyOf) : IsObject6(type6) ? FromObject15(type6.properties) : _Object_({});
}

// node_modules/typebox/build/type/engine/partial/instantiate.mjs
function PartialAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(FromType17(type6), {}, options) : PartialDeferred(type6, options);
  return result;
}
function PartialInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return PartialAction(instantiatedType, options);
}

// node_modules/typebox/build/type/action/pick.mjs
function PickDeferred(type6, indexer, options = {}) {
  return Deferred("Pick", [type6, indexer], options);
}

// node_modules/typebox/build/type/engine/pick/from_type.mjs
function FromKeys2(properties4, keys) {
  const result = exports_guard.Keys(properties4).reduce((result2, key) => {
    return keys.includes(key) ? exports_memory.Assign(result2, { [key]: properties4[key] }) : result2;
  }, {});
  return result;
}
function FromType18(type6, indexer) {
  const indexable = ToIndexable(type6);
  const keys = ToIndexableKeys(indexer);
  const applied = FromKeys2(indexable, keys);
  const result = _Object_(applied);
  return result;
}

// node_modules/typebox/build/type/engine/pick/instantiate.mjs
function PickAction(type6, indexer, options) {
  const result = CanInstantiate([type6, indexer]) ? exports_memory.Update(FromType18(type6, indexer), {}, options) : PickDeferred(type6, indexer, options);
  return result;
}
function PickInstantiate(context, state, type6, indexer, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  const instantiatedIndexer = InstantiateType(context, state, indexer);
  return PickAction(instantiatedType, instantiatedIndexer, options);
}

// node_modules/typebox/build/type/action/readonly_object.mjs
function ReadonlyObjectDeferred(type6, options = {}) {
  return Deferred("ReadonlyObject", [type6], options);
}

// node_modules/typebox/build/type/engine/readonly_object/from_array.mjs
function FromArray12(type6) {
  const result = AddImmutable(_Array_(type6));
  return result;
}

// node_modules/typebox/build/type/engine/readonly_object/from_cyclic.mjs
function FromCyclic4(defs2, ref7) {
  const target2 = CyclicTarget(defs2, ref7);
  const partial3 = FromType19(target2);
  const result = Cyclic(exports_memory.Assign(defs2, { [ref7]: partial3 }), ref7);
  return result;
}

// node_modules/typebox/build/type/engine/readonly_object/from_dependent.mjs
function FromDependent4(if_, then_, else_) {
  const evaluated = EvaluateDependent(if_, then_, else_);
  const result = FromType19(evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/readonly_object/from_intersect.mjs
function FromIntersect12(types2) {
  const evaluated = EvaluateIntersect(types2);
  const result = FromType19(evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/readonly_object/from_object.mjs
function FromObject16(properties4) {
  const mapped3 = exports_guard.Keys(properties4).reduce((result2, left) => {
    return { ...result2, [left]: AddReadonly2(properties4[left]) };
  }, {});
  const result = _Object_(mapped3);
  return result;
}

// node_modules/typebox/build/type/engine/readonly_object/from_tuple.mjs
function FromTuple9(types2) {
  const result = AddImmutable(Tuple2(types2));
  return result;
}

// node_modules/typebox/build/type/engine/readonly_object/from_union.mjs
function FromUnion17(types2) {
  const result = types2.map((type6) => FromType19(type6));
  return Union2(result);
}

// node_modules/typebox/build/type/engine/readonly_object/from_type.mjs
function FromType19(type6) {
  return IsArray6(type6) ? FromArray12(type6.items) : IsCyclic(type6) ? FromCyclic4(type6.$defs, type6.$ref) : IsDependent(type6) ? FromDependent4(type6.if, type6.then, type6.else) : IsIntersect3(type6) ? FromIntersect12(type6.allOf) : IsObject6(type6) ? FromObject16(type6.properties) : IsTuple3(type6) ? FromTuple9(type6.items) : IsUnion3(type6) ? FromUnion17(type6.anyOf) : type6;
}

// node_modules/typebox/build/type/engine/readonly_object/instantiate.mjs
function ReadonlyObjectAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(FromType19(type6), {}, options) : ReadonlyObjectDeferred(type6);
  return result;
}
function ReadonlyObjectInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return ReadonlyObjectAction(instantiatedType, options);
}

// node_modules/typebox/build/type/engine/ref/instantiate.mjs
function RefInstantiate(context, state, type6, ref7) {
  return state.visited.includes(ref7) ? type6 : (ref7 in context) ? InstantiateType(context, State(state["callstack"], [...state["visited"], ref7]), context[ref7]) : type6;
}

// node_modules/typebox/build/type/engine/required/from_cyclic.mjs
function FromCyclic5(defs2, ref7) {
  const target2 = CyclicTarget(defs2, ref7);
  const partial3 = FromType20(target2);
  const result = Cyclic(exports_memory.Assign(defs2, { [ref7]: partial3 }), ref7);
  return result;
}

// node_modules/typebox/build/type/engine/required/from_dependent.mjs
function FromDependent5(if_, then_, else_) {
  const evaluated = EvaluateDependent(if_, then_, else_);
  const result = FromType20(evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/required/from_intersect.mjs
function FromIntersect13(types2) {
  const evaluated = EvaluateIntersect(types2);
  const result = FromType20(evaluated);
  return result;
}

// node_modules/typebox/build/type/engine/required/from_union.mjs
function FromUnion18(types2) {
  const result = types2.map((type6) => FromType20(type6));
  return Union2(result);
}

// node_modules/typebox/build/type/engine/required/from_object.mjs
function FromObject17(properties4) {
  const mapped3 = exports_guard.Keys(properties4).reduce((result2, left) => {
    return { ...result2, [left]: RemoveOptional2(properties4[left]) };
  }, {});
  const result = _Object_(mapped3);
  return result;
}

// node_modules/typebox/build/type/engine/required/from_type.mjs
function FromType20(type6) {
  return IsCyclic(type6) ? FromCyclic5(type6.$defs, type6.$ref) : IsDependent(type6) ? FromDependent5(type6.if, type6.then, type6.else) : IsIntersect3(type6) ? FromIntersect13(type6.allOf) : IsUnion3(type6) ? FromUnion18(type6.anyOf) : IsObject6(type6) ? FromObject17(type6.properties) : _Object_({});
}

// node_modules/typebox/build/type/action/required.mjs
function RequiredDeferred(type6, options = {}) {
  return Deferred("Required", [type6], options);
}

// node_modules/typebox/build/type/engine/required/instantiate.mjs
function RequiredAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(FromType20(type6), {}, options) : RequiredDeferred(type6, options);
  return result;
}
function RequiredInstantiate(context, state, type6, options) {
  const instaniatedType = InstantiateType(context, state, type6);
  return RequiredAction(instaniatedType, options);
}

// node_modules/typebox/build/type/action/return_type.mjs
function ReturnTypeDeferred(type6, options = {}) {
  return Deferred("ReturnType", [type6], options);
}

// node_modules/typebox/build/type/engine/return_type/instantiate.mjs
function ReturnTypeOperation(type6) {
  return IsFunction5(type6) ? type6["returnType"] : Never2();
}
function ReturnTypeAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(ReturnTypeOperation(type6), {}, options) : ReturnTypeDeferred(type6, options);
  return result;
}
function ReturnTypeInstantiate(context, state, type6, options = {}) {
  const instantiatedType = InstantiateType(context, state, type6);
  return ReturnTypeAction(instantiatedType, options);
}

// node_modules/typebox/build/type/action/with.mjs
function WithDeferred(type6, options) {
  return Deferred("With", [type6, options], {});
}
function With(type6, options) {
  return WithAction(type6, options);
}

// node_modules/typebox/build/type/engine/with/instantiate.mjs
function WithAction(type6, options) {
  const result = CanInstantiate([type6]) ? exports_memory.Update(type6, {}, options) : WithDeferred(type6, options);
  return result;
}
function WithInstantiate(context, state, type6, options) {
  const instaniatedType = InstantiateType(context, state, type6);
  return WithAction(instaniatedType, options);
}

// node_modules/typebox/build/type/engine/rest/spread.mjs
function SpreadElement(type6) {
  const result = IsRest(type6) ? IsTuple3(type6.items) ? RestSpread(type6.items.items) : IsInfer(type6.items) ? [type6] : IsRef4(type6.items) ? [type6] : [Never2()] : [type6];
  return result;
}
function RestSpread(types2) {
  const result = types2.reduce((result2, left) => {
    return [...result2, ...SpreadElement(left)];
  }, []);
  return result;
}
// node_modules/typebox/build/type/engine/instantiate.mjs
function State(callstack, visited) {
  return { callstack, visited };
}
function CanInstantiate(types2) {
  return exports_guard.ShiftLeft(types2, (left, right) => IsRef4(left) ? false : CanInstantiate(right), () => true);
}
function InstantiateProperties(context, state, properties4) {
  return exports_guard.Keys(properties4).reduce((result, key) => {
    return { ...result, [key]: InstantiateType(context, state, properties4[key]) };
  }, {});
}
function InstantiateElements(context, state, types2) {
  const elements = InstantiateTypes(context, state, types2);
  const result = RestSpread(elements);
  return result;
}
function InstantiateTypes(context, state, types2) {
  return types2.map((type6) => InstantiateType(context, state, type6));
}
function WithModifiers(type6, instantiatedType) {
  const withOptional = IsOptional3(type6) ? AddOptionalAction(instantiatedType, {}) : instantiatedType;
  const withReadonly = IsReadonly3(type6) ? AddReadonlyAction(withOptional, {}) : withOptional;
  const withImmutable = IsImmutable(type6) ? AddImmutableAction(withReadonly, {}) : withReadonly;
  return withImmutable;
}
function InstantiateDeferred(context, state, action, parameters3, options) {
  return exports_guard.IsEqual(action, "AddImmutable") ? AddImmutableInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "RemoveImmutable") ? RemoveImmutableInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "AddReadonly") ? AddReadonlyInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "RemoveReadonly") ? RemoveReadonlyInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "AddOptional") ? AddOptionalInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "RemoveOptional") ? RemoveOptionalInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Capitalize") ? CapitalizeInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Conditional") ? ConditionalInstantiate(context, state, parameters3[0], parameters3[1], parameters3[2], parameters3[3], options) : exports_guard.IsEqual(action, "ConstructorParameters") ? ConstructorParametersInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Evaluate") ? EvaluateInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Exclude") ? ExcludeInstantiate(context, state, parameters3[0], parameters3[1], options) : exports_guard.IsEqual(action, "Extract") ? ExtractInstantiate(context, state, parameters3[0], parameters3[1], options) : exports_guard.IsEqual(action, "Index") ? IndexInstantiate(context, state, parameters3[0], parameters3[1], options) : exports_guard.IsEqual(action, "InstanceType") ? InstanceTypeInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Interface") ? InterfaceInstantiate(context, state, parameters3[0], parameters3[1], options) : exports_guard.IsEqual(action, "KeyOf") ? KeyOfInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Lowercase") ? LowercaseInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Mapped") ? MappedInstantiate(context, state, parameters3[0], parameters3[1], parameters3[2], parameters3[3], options) : exports_guard.IsEqual(action, "Module") ? ModuleInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "NonNullable") ? NonNullableInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Pick") ? PickInstantiate(context, state, parameters3[0], parameters3[1], options) : exports_guard.IsEqual(action, "Parameters") ? ParametersInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Partial") ? PartialInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Omit") ? OmitInstantiate(context, state, parameters3[0], parameters3[1], options) : exports_guard.IsEqual(action, "ReadonlyObject") ? ReadonlyObjectInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Record") ? RecordInstantiate(context, state, parameters3[0], parameters3[1], options) : exports_guard.IsEqual(action, "Required") ? RequiredInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "ReturnType") ? ReturnTypeInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "TemplateLiteral") ? TemplateLiteralInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Uncapitalize") ? UncapitalizeInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "Uppercase") ? UppercaseInstantiate(context, state, parameters3[0], options) : exports_guard.IsEqual(action, "With") ? WithInstantiate(context, state, parameters3[0], parameters3[1]) : Deferred(action, parameters3, options);
}
function InstantiateImmediate(context, state, type6) {
  const instantiatedType = IsRef4(type6) ? RefInstantiate(context, state, type6, type6.$ref) : IsArray6(type6) ? _Array_(InstantiateType(context, state, type6.items), ArrayOptions(type6)) : IsCall(type6) ? CallInstantiate(context, state, type6.target, type6.arguments) : IsConstructor4(type6) ? Constructor2(InstantiateTypes(context, state, type6.parameters), InstantiateType(context, state, type6.instanceType), ConstructorOptions(type6)) : IsFunction5(type6) ? _Function_(InstantiateTypes(context, state, type6.parameters), InstantiateType(context, state, type6.returnType), FunctionOptions(type6)) : IsDependent(type6) ? Dependent(InstantiateType(context, state, type6.if), InstantiateType(context, state, type6.then), InstantiateType(context, state, type6.else), DependentOptions(type6)) : IsIntersect3(type6) ? Intersect2(InstantiateTypes(context, state, type6.allOf), IntersectOptions(type6)) : IsObject6(type6) ? _Object_(InstantiateProperties(context, state, type6.properties), ObjectOptions(type6)) : IsRecord3(type6) ? RecordFromPattern(RecordPattern2(type6), InstantiateType(context, state, RecordValue3(type6))) : IsRest(type6) ? Rest2(InstantiateType(context, state, type6.items)) : IsTuple3(type6) ? Tuple2(InstantiateElements(context, state, type6.items), TupleOptions(type6)) : IsUnion3(type6) ? Union2(InstantiateTypes(context, state, type6.anyOf), UnionOptions(type6)) : type6;
  const withModifiers = WithModifiers(type6, instantiatedType);
  return withModifiers;
}
function InstantiateType(context, state, type6) {
  const result = IsDeferred(type6) ? InstantiateDeferred(context, state, type6.action, type6.parameters, type6.options) : InstantiateImmediate(context, state, type6);
  return result;
}
function Instantiate2(context, type6) {
  return InstantiateType(context, State([], []), type6);
}

// node_modules/typebox/build/type/engine/immutable/instantiate_add.mjs
function AddImmutableOperation(type6) {
  return exports_memory.Update(type6, { "~immutable": true }, {});
}
function AddImmutableAction(type6, options) {
  const result = exports_memory.Update(AddImmutableOperation(type6), {}, options);
  return result;
}
function AddImmutableInstantiate(context, state, type6, options) {
  const instantiatedType = InstantiateType(context, state, type6);
  return AddImmutableAction(instantiatedType, options);
}

// node_modules/typebox/build/type/action/_add_immutable.mjs
function AddImmutable(type6, options = {}) {
  return AddImmutableAction(type6, options);
}
// node_modules/typebox/build/type/action/evaluate.mjs
function Evaluate(type6, options = {}) {
  return EvaluateAction(type6, options);
}
// node_modules/typebox/build/type/engine/priority/priority.mjs
function Comparer(left, right) {
  const compareResult = Compare(left, right);
  const result = exports_guard.IsEqual(compareResult, "right-inside") ? 1 : exports_guard.IsEqual(compareResult, "disjoint") ? 1 : 0;
  return result;
}
function Insert(type6, types2, result = []) {
  return exports_guard.ShiftLeft(types2, (left, right) => exports_guard.IsEqual(Comparer(type6, left), 1) ? Insert(type6, right, [...result, left]) : [...result, type6, ...types2], () => [...result, type6]);
}
function Sort(types2, result = []) {
  return exports_guard.ShiftLeft(types2, (left, right) => Sort(right, Insert(left, result)), () => result);
}
function Priority(types2) {
  const result = Sort(types2);
  return result;
}
// node_modules/typebox/build/value/clean/from_array.mjs
function FromArray13(context, type6, value2) {
  if (!exports_guard.IsArray(value2))
    return value2;
  return value2.map((value3) => FromType21(context, type6.items, value3));
}

// node_modules/typebox/build/value/clean/from_cyclic.mjs
function FromCyclic6(context, type6, value2) {
  return FromType21({ ...context, ...type6.$defs }, Ref3(type6.$ref), value2);
}

// node_modules/typebox/build/value/clean/from_intersect.mjs
function EvaluateIntersection(context, type6) {
  const additionalProperties3 = exports_guard.HasPropertyKey(type6, "unevaluatedProperties") ? { additionalProperties: type6.unevaluatedProperties } : {};
  const instantiated = Instantiate2(context, type6);
  const evaluated = Evaluate(instantiated);
  return IsObject6(evaluated) ? With(evaluated, additionalProperties3) : evaluated;
}
function FromIntersect14(context, type6, value2) {
  const evaluated = EvaluateIntersection(context, type6);
  return FromType21(context, evaluated, value2);
}

// node_modules/typebox/build/value/clean/additional.mjs
function GetAdditionalProperties(type6) {
  const additionalProperties3 = exports_guard.HasPropertyKey(type6, "additionalProperties") ? type6.additionalProperties : undefined;
  return additionalProperties3;
}

// node_modules/typebox/build/value/clean/from_object.mjs
function FromObject18(context, type6, value2) {
  if (!exports_guard.IsObject(value2) || exports_guard.IsArray(value2))
    return value2;
  const additionalProperties3 = GetAdditionalProperties(type6);
  for (const key of exports_guard.Keys(value2)) {
    if (exports_guard.HasPropertyKey(type6.properties, key)) {
      value2[key] = FromType21(context, type6.properties[key], value2[key]);
      continue;
    }
    const unknownCheck = exports_guard.IsBoolean(additionalProperties3) && exports_guard.IsEqual(additionalProperties3, true) || IsSchema4(additionalProperties3) && Check2(context, additionalProperties3, value2[key]);
    if (unknownCheck) {
      value2[key] = FromType21(context, additionalProperties3, value2[key]);
      continue;
    }
    delete value2[key];
  }
  return value2;
}

// node_modules/typebox/build/value/clean/from_record.mjs
function FromRecord6(context, type6, value2) {
  if (!exports_guard.IsObject(value2))
    return value2;
  const additionalProperties3 = GetAdditionalProperties(type6);
  const [recordPattern, recordValue] = [new RegExp(RecordPattern2(type6)), RecordValue3(type6)];
  for (const key of exports_guard.Keys(value2)) {
    if (recordPattern.test(key)) {
      value2[key] = FromType21(context, recordValue, value2[key]);
      continue;
    }
    const unknownCheck = exports_guard.IsBoolean(additionalProperties3) && exports_guard.IsEqual(additionalProperties3, true) || IsSchema4(additionalProperties3) && Check2(context, additionalProperties3, value2[key]);
    if (unknownCheck) {
      value2[key] = FromType21(context, additionalProperties3, value2[key]);
      continue;
    }
    delete value2[key];
  }
  return value2;
}

// node_modules/typebox/build/value/clean/from_ref.mjs
function FromRef9(context, type6, value2) {
  return exports_guard.HasPropertyKey(context, type6.$ref) ? FromType21(context, context[type6.$ref], value2) : value2;
}

// node_modules/typebox/build/value/clean/from_tuple.mjs
function FromTuple10(context, schema7, value2) {
  if (!exports_guard.IsArray(value2))
    return value2;
  const length = Math.min(value2.length, schema7.items.length);
  for (let index = 0;index < length; index++) {
    value2[index] = FromType21(context, schema7.items[index], value2[index]);
  }
  return exports_guard.IsGreaterThan(value2.length, length) ? value2.slice(0, length) : value2;
}

// node_modules/typebox/build/value/clone/clone.mjs
function Clone3(value2) {
  return Clone2(value2);
}
// node_modules/typebox/build/value/clean/from_union.mjs
function FromUnion19(context, type6, value2) {
  for (const schema7 of type6.anyOf) {
    const clean = FromType21(context, schema7, Clone3(value2));
    if (Check2(context, schema7, clean))
      return clean;
  }
  return value2;
}

// node_modules/typebox/build/value/clean/from_type.mjs
function FromType21(context, type6, value2) {
  return IsArray6(type6) ? FromArray13(context, type6, value2) : IsCyclic(type6) ? FromCyclic6(context, type6, value2) : IsIntersect3(type6) ? FromIntersect14(context, type6, value2) : IsObject6(type6) ? FromObject18(context, type6, value2) : IsRecord3(type6) ? FromRecord6(context, type6, value2) : IsRef4(type6) ? FromRef9(context, type6, value2) : IsTuple3(type6) ? FromTuple10(context, type6, value2) : IsUnion3(type6) ? FromUnion19(context, type6, value2) : value2;
}

// node_modules/typebox/build/value/shared/union_priority_sort.mjs
function Modifiers(type6, next) {
  for (const key of guard_default.Keys(type6)) {
    if (guard_default.HasPropertyKey(next, key))
      continue;
    next[key] = type6[key];
  }
  return next;
}
function FromProperties23(properties4) {
  const result = {};
  for (const key of guard_default.Keys(properties4))
    result[key] = FromType22(properties4[key]);
  return result;
}
function FromPriorityTypes(types3) {
  return FromTypes8(Priority(types3));
}
function FromTypes8(types3) {
  return types3.map((type6) => FromType22(type6));
}
function FromType22(type6) {
  const next = IsArray6(type6) ? _Array_(FromType22(type6.items), ArrayOptions(type6)) : IsIntersect3(type6) ? Intersect2(FromTypes8(type6.allOf)) : IsUnion3(type6) ? Union2(FromPriorityTypes(type6.anyOf)) : IsObject6(type6) ? _Object_(FromProperties23(type6.properties)) : IsRecord3(type6) ? Record2(RecordKey3(type6), FromType22(RecordValue3(type6))) : IsTuple3(type6) ? Tuple2(FromTypes8(type6.items)) : type6;
  return Modifiers(type6, next);
}
function UnionPrioritySort(type6) {
  const result = FromType22(type6);
  return result;
}

// node_modules/typebox/build/value/clean/clean.mjs
function Clean(...args) {
  const [context, type6, value2] = exports_arguments.Match(args, {
    3: (context2, type7, value3) => [context2, type7, value3],
    2: (type7, value3) => [{}, type7, value3]
  });
  const sorted = exports_settings.Get().unionPrioritySort ? UnionPrioritySort(type6) : type6;
  return FromType21(context, sorted, value2);
}
// node_modules/typebox/build/value/convert/try/try.mjs
var exports_try = {};
__export(exports_try, {
  TryUndefined: () => TryUndefined,
  TryString: () => TryString,
  TryNumber: () => TryNumber,
  TryNull: () => TryNull,
  TryBoolean: () => TryBoolean,
  TryBigInt: () => TryBigInt,
  TryArray: () => TryArray,
  Ok: () => Ok,
  IsOk: () => IsOk,
  Fail: () => Fail
});

// node_modules/typebox/build/value/convert/try/try_result.mjs
function IsOk(value2) {
  return exports_guard.IsObject(value2) && exports_guard.HasPropertyKey(value2, "value");
}
function Ok(value2) {
  return { value: value2 };
}
function Fail() {
  return;
}

// node_modules/typebox/build/value/convert/try/try_array.mjs
function TryArray(value2) {
  return exports_guard.IsArray(value2) ? Ok(value2) : Ok([value2]);
}
// node_modules/typebox/build/value/convert/try/try_bigint.mjs
function FromBoolean3(value2) {
  return exports_guard.IsEqual(value2, true) ? Ok(BigInt(1)) : Ok(BigInt(0));
}
var bigintPattern = /^-?(0|[1-9]\d*)n$/;
var decimalPattern = /^-?(0|[1-9]\d*)\.\d+$/;
var integerPattern = /^-?(0|[1-9]\d*)$/;
function IsStringBigIntLike(value2) {
  return bigintPattern.test(value2);
}
function IsStringDecimalLike(value2) {
  return decimalPattern.test(value2);
}
function IsStringIntegerLike(value2) {
  return integerPattern.test(value2);
}
function FromString3(value2) {
  const lowercase3 = value2.toLowerCase();
  return IsStringBigIntLike(value2) ? Ok(BigInt(value2.slice(0, value2.length - 1))) : IsStringDecimalLike(value2) ? Ok(BigInt(value2.split(".")[0])) : IsStringIntegerLike(value2) ? Ok(BigInt(value2)) : exports_guard.IsEqual(lowercase3, "false") ? Ok(BigInt(0)) : exports_guard.IsEqual(lowercase3, "true") ? Ok(BigInt(1)) : Fail();
}
function TryBigInt(value2) {
  return exports_guard.IsBigInt(value2) ? Ok(value2) : exports_guard.IsBoolean(value2) ? FromBoolean3(value2) : exports_guard.IsNumber(value2) ? Ok(BigInt(Math.trunc(value2))) : exports_guard.IsNull(value2) ? Ok(BigInt(0)) : exports_guard.IsString(value2) ? FromString3(value2) : exports_guard.IsUndefined(value2) ? Ok(BigInt(0)) : Fail();
}
// node_modules/typebox/build/value/convert/try/try_boolean.mjs
function FromBigInt3(value2) {
  return exports_guard.IsEqual(value2, BigInt(0)) ? Ok(false) : exports_guard.IsEqual(value2, BigInt(1)) ? Ok(true) : Fail();
}
function FromNumber3(value2) {
  return exports_guard.IsEqual(value2, 0) ? Ok(false) : exports_guard.IsEqual(value2, 1) ? Ok(true) : Fail();
}
function FromString4(value2) {
  return exports_guard.IsEqual(value2.toLowerCase(), "false") ? Ok(false) : exports_guard.IsEqual(value2.toLowerCase(), "true") ? Ok(true) : exports_guard.IsEqual(value2, "0") ? Ok(false) : exports_guard.IsEqual(value2, "1") ? Ok(true) : Fail();
}
function TryBoolean(value2) {
  return exports_guard.IsBigInt(value2) ? FromBigInt3(value2) : exports_guard.IsBoolean(value2) ? Ok(value2) : exports_guard.IsNumber(value2) ? FromNumber3(value2) : exports_guard.IsNull(value2) ? Ok(false) : exports_guard.IsString(value2) ? FromString4(value2) : exports_guard.IsUndefined(value2) ? Ok(false) : Fail();
}
// node_modules/typebox/build/value/convert/try/try_null.mjs
function FromBigInt4(value2) {
  return exports_guard.IsEqual(value2, BigInt(0)) ? Ok(null) : Fail();
}
function FromBoolean4(value2) {
  return exports_guard.IsEqual(value2, false) ? Ok(null) : Fail();
}
function FromNumber4(value2) {
  return exports_guard.IsEqual(value2, 0) ? Ok(null) : Fail();
}
function FromString5(value2) {
  const lowercase3 = value2.toLowerCase();
  const predicate = exports_guard.IsEqual(lowercase3, "undefined") || exports_guard.IsEqual(lowercase3, "null") || exports_guard.IsEqual(value2, "") || exports_guard.IsEqual(value2, "0");
  return predicate ? Ok(null) : Fail();
}
function TryNull(value2) {
  return exports_guard.IsBigInt(value2) ? FromBigInt4(value2) : exports_guard.IsBoolean(value2) ? FromBoolean4(value2) : exports_guard.IsNumber(value2) ? FromNumber4(value2) : exports_guard.IsNull(value2) ? Ok(null) : exports_guard.IsString(value2) ? FromString5(value2) : exports_guard.IsUndefined(value2) ? Ok(null) : Fail();
}
// node_modules/typebox/build/value/convert/try/try_number.mjs
var maxBigInt = BigInt(Number.MAX_SAFE_INTEGER);
var minBigInt = BigInt(Number.MIN_SAFE_INTEGER);
function FromBigInt5(value2) {
  return value2 <= maxBigInt && value2 >= minBigInt ? Ok(Number(value2)) : Fail();
}
function FromBoolean5(value2) {
  return Ok(value2 ? 1 : 0);
}
function FromString6(value2) {
  const coerced = +value2;
  if (exports_guard.IsNumber(coerced))
    return Ok(coerced);
  const lowercase3 = value2.toLowerCase();
  if (exports_guard.IsEqual(lowercase3, "false"))
    return Ok(0);
  if (exports_guard.IsEqual(lowercase3, "true"))
    return Ok(1);
  const result = TryBigInt(value2);
  if (IsOk(result))
    return result.value <= maxBigInt && result.value >= minBigInt ? Ok(Number(result.value)) : Fail();
  return Fail();
}
function TryNumber(value2) {
  return exports_guard.IsBigInt(value2) ? FromBigInt5(value2) : exports_guard.IsBoolean(value2) ? FromBoolean5(value2) : exports_guard.IsNumber(value2) ? Ok(value2) : exports_guard.IsNull(value2) ? Ok(0) : exports_guard.IsString(value2) ? FromString6(value2) : exports_guard.IsUndefined(value2) ? Ok(0) : Fail();
}
// node_modules/typebox/build/value/convert/try/try_string.mjs
function TryString(value2) {
  return exports_guard.IsBigInt(value2) ? Ok(value2.toString()) : exports_guard.IsBoolean(value2) ? Ok(value2.toString()) : exports_guard.IsNumber(value2) ? Ok(value2.toString()) : exports_guard.IsNull(value2) ? Ok("null") : exports_guard.IsString(value2) ? Ok(value2) : exports_guard.IsUndefined(value2) ? Ok("") : Fail();
}
// node_modules/typebox/build/value/convert/try/try_undefined.mjs
function FromBigInt6(value2) {
  return exports_guard.IsEqual(value2, BigInt(0)) ? Ok(undefined) : Fail();
}
function FromBoolean6(value2) {
  return exports_guard.IsEqual(value2, false) ? Ok(undefined) : Fail();
}
function FromNumber5(value2) {
  return exports_guard.IsEqual(value2, 0) ? Ok(undefined) : Fail();
}
function FromString7(value2) {
  const lowercase3 = value2.toLowerCase();
  const predicate = exports_guard.IsEqual(lowercase3, "undefined") || exports_guard.IsEqual(lowercase3, "null") || exports_guard.IsEqual(value2, "") || exports_guard.IsEqual(value2, "0");
  return predicate ? Ok(undefined) : Fail();
}
function TryUndefined(value2) {
  return exports_guard.IsBigInt(value2) ? FromBigInt6(value2) : exports_guard.IsBoolean(value2) ? FromBoolean6(value2) : exports_guard.IsNumber(value2) ? FromNumber5(value2) : exports_guard.IsNull(value2) ? Ok(undefined) : exports_guard.IsString(value2) ? FromString7(value2) : exports_guard.IsUndefined(value2) ? Ok(value2) : Fail();
}
// node_modules/typebox/build/value/convert/from_array.mjs
function FromArray14(context, type6, value2) {
  const result = exports_try.TryArray(value2);
  return result.value.map((value3) => FromType23(context, type6.items, value3));
}

// node_modules/typebox/build/value/convert/from_bigint.mjs
function FromBigInt7(_context2, _type, value2) {
  const result = exports_try.TryBigInt(value2);
  return exports_try.IsOk(result) ? result.value : value2;
}

// node_modules/typebox/build/value/convert/from_boolean.mjs
function FromBoolean7(_context2, _type, value2) {
  const result = exports_try.TryBoolean(value2);
  return exports_try.IsOk(result) ? result.value : value2;
}

// node_modules/typebox/build/value/convert/from_cyclic.mjs
function FromCyclic7(context, type6, value2) {
  return FromType23({ ...context, ...type6.$defs }, Ref3(type6.$ref), value2);
}

// node_modules/typebox/build/value/convert/from_enum.mjs
function FromEnum3(context, type6, value2) {
  return FromType23(context, Evaluate(type6), value2);
}

// node_modules/typebox/build/value/convert/from_integer.mjs
function FromInteger2(_context2, _type, value2) {
  const result = exports_try.TryNumber(value2);
  return exports_try.IsOk(result) ? Math.trunc(result.value) : value2;
}

// node_modules/typebox/build/value/convert/from_intersect.mjs
function FromIntersect15(context, type6, value2) {
  const instantiated = Instantiate2(context, type6);
  const evaluated = Evaluate(instantiated);
  return FromType23(context, evaluated, value2);
}

// node_modules/typebox/build/value/convert/from_literal.mjs
function FromLiteralBigInt(_context2, type6, value2) {
  const result = exports_try.TryBigInt(value2);
  return exports_try.IsOk(result) && exports_guard.IsEqual(type6.const, result.value) ? result.value : value2;
}
function FromLiteralBoolean(_context2, type6, value2) {
  const result = exports_try.TryBoolean(value2);
  return exports_try.IsOk(result) && exports_guard.IsEqual(type6.const, result.value) ? result.value : value2;
}
function FromLiteralNumber(_context2, type6, value2) {
  const result = exports_try.TryNumber(value2);
  return exports_try.IsOk(result) && exports_guard.IsEqual(type6.const, result.value) ? result.value : value2;
}
function FromLiteralString(_context2, type6, value2) {
  const result = exports_try.TryString(value2);
  return exports_try.IsOk(result) && exports_guard.IsEqual(type6.const, result.value) ? result.value : value2;
}
function FromLiteral8(context, type6, value2) {
  if (exports_guard.IsEqual(type6.const, value2))
    return value2;
  return IsLiteralBigInt(type6) ? FromLiteralBigInt(context, type6, value2) : IsLiteralBoolean2(type6) ? FromLiteralBoolean(context, type6, value2) : IsLiteralNumber2(type6) ? FromLiteralNumber(context, type6, value2) : IsLiteralString2(type6) ? FromLiteralString(context, type6, value2) : Unreachable();
}

// node_modules/typebox/build/value/convert/from_null.mjs
function FromNull3(_context2, _type, value2) {
  const result = exports_try.TryNull(value2);
  return exports_try.IsOk(result) ? result.value : value2;
}

// node_modules/typebox/build/value/convert/from_number.mjs
function FromNumber6(_context2, _type, value2) {
  const result = exports_try.TryNumber(value2);
  return exports_try.IsOk(result) ? result.value : value2;
}

// node_modules/typebox/build/value/convert/from_additional.mjs
function FromAdditionalProperties(context, entries, additionalProperties3, value2) {
  const keys2 = exports_guard.Keys(value2);
  for (const [regexp3, _2] of entries) {
    for (const key of keys2) {
      if (!regexp3.test(key)) {
        value2[key] = FromType23(context, additionalProperties3, value2[key]);
      }
    }
  }
  return value2;
}

// node_modules/typebox/build/value/shared/optional_undefined.mjs
function IsOptionalUndefined(property, key, value2) {
  return IsOptional3(property) && exports_guard.IsUndefined(value2[key]);
}

// node_modules/typebox/build/value/convert/from_object.mjs
function FromProperties24(context, type6, value2) {
  const entries = exports_guard.EntriesRegExp(type6.properties);
  const keys2 = exports_guard.Keys(value2);
  for (const [regexp3, property] of entries) {
    for (const key of keys2) {
      if (!regexp3.test(key) || IsOptionalUndefined(property, key, value2))
        continue;
      value2[key] = FromType23(context, property, value2[key]);
    }
  }
  return exports_guard.HasPropertyKey(type6, "additionalProperties") && exports_guard.IsObject(type6.additionalProperties) ? FromAdditionalProperties(context, entries, type6.additionalProperties, value2) : value2;
}
function FromObject19(context, type6, value2) {
  return exports_guard.IsObjectNotArray(value2) ? FromProperties24(context, type6, value2) : value2;
}

// node_modules/typebox/build/value/convert/from_record.mjs
function FromPatternProperties2(context, type6, value2) {
  const entries = exports_guard.EntriesRegExp(type6.patternProperties);
  const keys2 = exports_guard.Keys(value2);
  for (const [regexp3, schema7] of entries) {
    for (const key of keys2) {
      if (regexp3.test(key)) {
        value2[key] = FromType23(context, schema7, value2[key]);
      }
    }
  }
  return exports_guard.HasPropertyKey(type6, "additionalProperties") && exports_guard.IsObject(type6.additionalProperties) ? FromAdditionalProperties(context, entries, type6.additionalProperties, value2) : value2;
}
function FromRecord7(context, type6, value2) {
  return exports_guard.IsObjectNotArray(value2) ? FromPatternProperties2(context, type6, value2) : value2;
}

// node_modules/typebox/build/value/convert/from_ref.mjs
function FromRef10(context, type6, value2) {
  return exports_guard.HasPropertyKey(context, type6.$ref) ? FromType23(context, context[type6.$ref], value2) : value2;
}

// node_modules/typebox/build/value/convert/from_string.mjs
function FromString8(_context2, _type, value2) {
  const result = exports_try.TryString(value2);
  return exports_try.IsOk(result) ? result.value : value2;
}

// node_modules/typebox/build/value/convert/from_template_literal.mjs
function FromTemplateLiteral7(context, type6, value2) {
  return FromType23(context, Evaluate(type6), value2);
}

// node_modules/typebox/build/value/convert/from_tuple.mjs
function FromTuple11(context, type6, value2) {
  if (!exports_guard.IsArray(value2))
    return value2;
  for (let index = 0;index < Math.min(type6.items.length, value2.length); index++) {
    value2[index] = FromType23(context, type6.items[index], value2[index]);
  }
  return value2;
}

// node_modules/typebox/build/value/convert/from_undefined.mjs
function FromUndefined3(_context2, _type, value2) {
  const result = exports_try.TryUndefined(value2);
  return exports_try.IsOk(result) ? result.value : value2;
}

// node_modules/typebox/build/value/convert/from_union.mjs
function FromUnion20(context, type6, value2) {
  const matched = type6.anyOf.some((type7) => Check2(context, type7, value2));
  if (matched)
    return value2;
  const candidates2 = type6.anyOf.map((type7) => FromType23(context, type7, Clone3(value2)));
  const selected = candidates2.find((value3) => Check2(context, type6, value3));
  return exports_guard.IsUndefined(selected) ? value2 : selected;
}

// node_modules/typebox/build/value/convert/from_void.mjs
function FromVoid2(_context2, _type, value2) {
  const result = exports_try.TryUndefined(value2);
  return exports_try.IsOk(result) ? undefined : value2;
}

// node_modules/typebox/build/value/convert/from_type.mjs
function FromType23(context, type6, value2) {
  return IsArray6(type6) ? FromArray14(context, type6, value2) : IsBigInt5(type6) ? FromBigInt7(context, type6, value2) : IsBoolean6(type6) ? FromBoolean7(context, type6, value2) : IsCyclic(type6) ? FromCyclic7(context, type6, value2) : IsEnum2(type6) ? FromEnum3(context, type6, value2) : IsInteger4(type6) ? FromInteger2(context, type6, value2) : IsIntersect3(type6) ? FromIntersect15(context, type6, value2) : IsLiteral3(type6) ? FromLiteral8(context, type6, value2) : IsNull5(type6) ? FromNull3(context, type6, value2) : IsNumber7(type6) ? FromNumber6(context, type6, value2) : IsObject6(type6) ? FromObject19(context, type6, value2) : IsRecord3(type6) ? FromRecord7(context, type6, value2) : IsRef4(type6) ? FromRef10(context, type6, value2) : IsString6(type6) ? FromString8(context, type6, value2) : IsTemplateLiteral3(type6) ? FromTemplateLiteral7(context, type6, value2) : IsTuple3(type6) ? FromTuple11(context, type6, value2) : IsUndefined6(type6) ? FromUndefined3(context, type6, value2) : IsUnion3(type6) ? FromUnion20(context, type6, value2) : IsVoid3(type6) ? FromVoid2(context, type6, value2) : value2;
}

// node_modules/typebox/build/value/convert/convert.mjs
function Convert(...args) {
  const [context, type6, value2] = exports_arguments.Match(args, {
    3: (context2, type7, value3) => [context2, type7, value3],
    2: (type7, value3) => [{}, type7, value3]
  });
  return FromType23(context, type6, value2);
}
// node_modules/typebox/build/value/default/from_array.mjs
function FromArray15(context, type6, value2) {
  if (!exports_guard.IsArray(value2))
    return value2;
  for (let i = 0;i < value2.length; i++) {
    value2[i] = FromType24(context, type6.items, value2[i]);
  }
  return value2;
}

// node_modules/typebox/build/value/default/from_cyclic.mjs
function FromCyclic8(context, type6, value2) {
  return FromType24({ ...context, ...type6.$defs }, Ref3(type6.$ref), value2);
}

// node_modules/typebox/build/value/default/from_default.mjs
function FromDefault(type6, value2) {
  if (!exports_guard.IsUndefined(value2))
    return value2;
  return exports_guard.IsFunction(type6.default) ? type6.default() : Clone3(type6.default);
}

// node_modules/typebox/build/value/default/from_intersect.mjs
function FromIntersect16(context, type6, value2) {
  const instantiated = Instantiate2(context, type6);
  const evaluated = Evaluate(instantiated);
  return FromType24(context, evaluated, value2);
}

// node_modules/typebox/build/value/default/from_object.mjs
function FromObject20(context, type6, value2) {
  if (!exports_guard.IsObject(value2))
    return value2;
  const knownPropertyKeys = exports_guard.Keys(type6.properties);
  for (const key of knownPropertyKeys) {
    const propertyValue = FromType24(context, type6.properties[key], value2[key]);
    const isUnassignableUndefined = exports_guard.IsUndefined(propertyValue) && (IsOptional3(type6.properties[key]) || !exports_guard.HasPropertyKey(type6.properties[key], "default"));
    if (isUnassignableUndefined)
      continue;
    value2[key] = propertyValue;
  }
  if (!IsAdditionalProperties2(type6) || exports_guard.IsBoolean(type6.additionalProperties))
    return value2;
  for (const key of exports_guard.Keys(value2)) {
    if (knownPropertyKeys.includes(key))
      continue;
    value2[key] = FromType24(context, type6.additionalProperties, value2[key]);
  }
  return value2;
}

// node_modules/typebox/build/value/default/from_record.mjs
function FromRecord8(context, type6, value2) {
  if (!exports_guard.IsObject(value2))
    return value2;
  const [recordKey, recordValue] = [new RegExp(RecordPattern2(type6)), RecordValue3(type6)];
  for (const key of exports_guard.Keys(value2)) {
    if (!(recordKey.test(key) && IsDefault(recordValue)))
      continue;
    value2[key] = FromType24(context, recordValue, value2[key]);
  }
  if (!IsAdditionalProperties2(type6))
    return value2;
  for (const key of exports_guard.Keys(value2)) {
    if (recordKey.test(key))
      continue;
    value2[key] = FromType24(context, type6.additionalProperties, value2[key]);
  }
  return value2;
}

// node_modules/typebox/build/value/default/from_ref.mjs
function FromRef11(context, type6, value2) {
  return exports_guard.HasPropertyKey(context, type6.$ref) ? FromType24(context, context[type6.$ref], value2) : value2;
}

// node_modules/typebox/build/value/default/from_tuple.mjs
function FromTuple12(context, schema7, value2) {
  if (!exports_guard.IsArray(value2))
    return value2;
  const [items3, max] = [schema7.items, Math.max(schema7.items.length, value2.length)];
  for (let i = 0;i < max; i++) {
    if (i < items3.length)
      value2[i] = FromType24(context, items3[i], value2[i]);
  }
  return value2;
}

// node_modules/typebox/build/value/default/from_union.mjs
function FromUnion21(context, schema7, value2) {
  for (const inner of schema7.anyOf) {
    const result = FromType24(context, inner, Clone3(value2));
    if (Check2(context, inner, result)) {
      return result;
    }
  }
  return value2;
}

// node_modules/typebox/build/value/default/from_type.mjs
function FromType24(context, type6, value2) {
  const defaulted = IsDefault(type6) ? FromDefault(type6, value2) : value2;
  return IsArray6(type6) ? FromArray15(context, type6, defaulted) : IsCyclic(type6) ? FromCyclic8(context, type6, defaulted) : IsIntersect3(type6) ? FromIntersect16(context, type6, defaulted) : IsObject6(type6) ? FromObject20(context, type6, defaulted) : IsRecord3(type6) ? FromRecord8(context, type6, defaulted) : IsRef4(type6) ? FromRef11(context, type6, defaulted) : IsTuple3(type6) ? FromTuple12(context, type6, defaulted) : IsUnion3(type6) ? FromUnion21(context, type6, defaulted) : defaulted;
}

// node_modules/typebox/build/value/default/default.mjs
function Default(...args) {
  const [context, type6, value2] = exports_arguments.Match(args, {
    3: (context2, type7, value3) => [context2, type7, value3],
    2: (type7, value3) => [{}, type7, value3]
  });
  return FromType24(context, type6, value2);
}
// node_modules/typebox/build/value/pipeline/pipeline.mjs
function Pipeline(pipeline) {
  return (...args) => {
    const [context, type6, value2] = exports_arguments.Match(args, {
      3: (context2, type7, value3) => [context2, type7, value3],
      2: (type7, value3) => [{}, type7, value3]
    });
    return pipeline.reduce((result, func) => func(context, type6, result), value2);
  };
}
// node_modules/typebox/build/value/codec/callback.mjs
function Decode2(_context2, type6, value2) {
  return type6["~codec"].decode(value2);
}
function Encode(_context2, type6, value2) {
  return type6["~codec"].encode(value2);
}
function Callback(direction, context, type6, value2) {
  if (!IsCodec(type6))
    return value2;
  return exports_guard.IsEqual(direction, "Decode") ? Decode2(context, type6, value2) : Encode(context, type6, value2);
}

// node_modules/typebox/build/value/codec/from_array.mjs
function Decode3(direction, context, type6, value2) {
  if (!exports_guard.IsArray(value2))
    return value2;
  for (let i = 0;i < value2.length; i++) {
    value2[i] = FromType25(direction, context, type6.items, value2[i]);
  }
  return Callback(direction, context, type6, value2);
}
function Encode2(direction, context, type6, value2) {
  const exterior = Callback(direction, context, type6, value2);
  if (!exports_guard.IsArray(exterior))
    return exterior;
  for (let i = 0;i < exterior.length; i++) {
    exterior[i] = FromType25(direction, context, type6.items, exterior[i]);
  }
  return exterior;
}
function FromArray16(direction, context, type6, value2) {
  return exports_guard.IsEqual(direction, "Decode") ? Decode3(direction, context, type6, value2) : Encode2(direction, context, type6, value2);
}

// node_modules/typebox/build/value/codec/from_cyclic.mjs
function FromCyclic9(direction, context, type6, value2) {
  value2 = FromType25(direction, { ...context, ...type6.$defs }, Ref3(type6.$ref), value2);
  return Callback(direction, context, type6, value2);
}

// node_modules/typebox/build/value/codec/from_intersect.mjs
function MergeInteriors(interiors) {
  return interiors.reduce((results, interior) => ({ ...results, ...interior }), {});
}
function NonMatchingInterior(value2, interiors) {
  for (const interior of interiors)
    if (!exports_guard.IsDeepEqual(value2, interior))
      return interior;
  return value2;
}
function Decode4(direction, context, type6, value2) {
  if (exports_guard.IsEqual(type6.allOf.length, 0))
    return Callback(direction, context, type6, value2);
  const interiors = type6.allOf.map((schema7) => FromType25(direction, context, schema7, Clean(schema7, Clone3(value2))));
  const structural = interiors.every((result) => exports_guard.IsObject(result));
  const exterior = structural ? MergeInteriors(interiors) : NonMatchingInterior(value2, interiors);
  return Callback(direction, context, type6, exterior);
}
function Encode3(direction, context, type6, value2) {
  if (exports_guard.IsEqual(type6.allOf.length, 0))
    return Callback(direction, context, type6, value2);
  const exterior = Callback(direction, context, type6, value2);
  const interiors = type6.allOf.map((schema7) => FromType25(direction, context, schema7, Clean(schema7, Clone3(exterior))));
  const structural = interiors.every((result) => exports_guard.IsObject(result));
  if (structural)
    return MergeInteriors(interiors);
  return NonMatchingInterior(exterior, interiors);
}
function FromIntersect17(direction, context, type6, value2) {
  return exports_guard.IsEqual(direction, "Decode") ? Decode4(direction, context, type6, value2) : Encode3(direction, context, type6, value2);
}

// node_modules/typebox/build/value/codec/from_object.mjs
function Decode5(direction, context, type6, value2) {
  if (!exports_guard.IsObjectNotArray(value2))
    return value2;
  for (const key of exports_guard.Keys(type6.properties)) {
    if (!exports_guard.HasPropertyKey(value2, key) || IsOptionalUndefined(type6.properties[key], key, value2))
      continue;
    value2[key] = FromType25(direction, context, type6.properties[key], value2[key]);
  }
  return Callback(direction, context, type6, value2);
}
function Encode4(direction, context, type6, value2) {
  const exterior = Callback(direction, context, type6, value2);
  if (!exports_guard.IsObjectNotArray(exterior))
    return exterior;
  for (const key of exports_guard.Keys(type6.properties)) {
    if (!exports_guard.HasPropertyKey(exterior, key) || IsOptionalUndefined(type6.properties[key], key, exterior))
      continue;
    exterior[key] = FromType25(direction, context, type6.properties[key], exterior[key]);
  }
  return exterior;
}
function FromObject21(direction, context, type6, value2) {
  return exports_guard.IsEqual(direction, "Decode") ? Decode5(direction, context, type6, value2) : Encode4(direction, context, type6, value2);
}

// node_modules/typebox/build/value/codec/from_record.mjs
function Decode6(direction, context, type6, value2) {
  if (!exports_guard.IsObjectNotArray(value2))
    return value2;
  const regexp3 = new RegExp(RecordPattern2(type6));
  for (const key of exports_guard.Keys(value2)) {
    if (!regexp3.test(key))
      continue;
    value2[key] = FromType25(direction, context, RecordValue3(type6), value2[key]);
  }
  return Callback(direction, context, type6, value2);
}
function Encode5(direction, context, type6, value2) {
  const exterior = Callback(direction, context, type6, value2);
  if (!exports_guard.IsObjectNotArray(exterior))
    return exterior;
  const regexp3 = new RegExp(RecordPattern2(type6));
  for (const key of exports_guard.Keys(exterior)) {
    if (!regexp3.test(key))
      continue;
    exterior[key] = FromType25(direction, context, RecordValue3(type6), exterior[key]);
  }
  return exterior;
}
function FromRecord9(direction, context, type6, value2) {
  return exports_guard.IsEqual(direction, "Decode") ? Decode6(direction, context, type6, value2) : Encode5(direction, context, type6, value2);
}

// node_modules/typebox/build/value/codec/from_ref.mjs
function ResolveRef(direction, context, type6, value2) {
  return exports_guard.HasPropertyKey(context, type6.$ref) ? FromType25(direction, context, context[type6.$ref], value2) : value2;
}
function FromRef12(direction, context, type6, value2) {
  return exports_guard.IsEqual(direction, "Decode") ? Callback(direction, context, type6, ResolveRef(direction, context, type6, value2)) : ResolveRef(direction, context, type6, Callback(direction, context, type6, value2));
}

// node_modules/typebox/build/value/codec/from_tuple.mjs
function Decode7(direction, context, type6, value2) {
  if (!exports_guard.IsArray(value2))
    return value2;
  for (let i = 0;i < Math.min(type6.items.length, value2.length); i++) {
    value2[i] = FromType25(direction, context, type6.items[i], value2[i]);
  }
  return Callback(direction, context, type6, value2);
}
function Encode6(direction, context, type6, value2) {
  const exterior = Callback(direction, context, type6, value2);
  if (!exports_guard.IsArray(exterior))
    return value2;
  for (let i = 0;i < Math.min(type6.items.length, exterior.length); i++) {
    exterior[i] = FromType25(direction, context, type6.items[i], exterior[i]);
  }
  return exterior;
}
function FromTuple13(direction, context, type6, value2) {
  return exports_guard.IsEqual(direction, "Decode") ? Decode7(direction, context, type6, value2) : Encode6(direction, context, type6, value2);
}

// node_modules/typebox/build/value/codec/from_union.mjs
function Decode8(direction, context, type6, value2) {
  for (const schema7 of type6.anyOf) {
    if (!Check2(context, schema7, value2))
      continue;
    const variant = FromType25(direction, context, schema7, value2);
    return Callback(direction, context, type6, variant);
  }
  return value2;
}
function Encode7(direction, context, type6, value2) {
  const exterior = Callback(direction, context, type6, value2);
  for (const schema7 of type6.anyOf) {
    const variant = FromType25(direction, context, schema7, Clone3(exterior));
    if (!Check2(context, schema7, variant))
      continue;
    return variant;
  }
  return exterior;
}
function FromUnion22(direction, context, type6, value2) {
  return exports_guard.IsEqual(direction, "Decode") ? Decode8(direction, context, type6, value2) : Encode7(direction, context, type6, value2);
}

// node_modules/typebox/build/value/codec/from_type.mjs
function FromType25(direction, context, type6, value2) {
  return IsArray6(type6) ? FromArray16(direction, context, type6, value2) : IsCyclic(type6) ? FromCyclic9(direction, context, type6, value2) : IsIntersect3(type6) ? FromIntersect17(direction, context, type6, value2) : IsObject6(type6) ? FromObject21(direction, context, type6, value2) : IsRecord3(type6) ? FromRecord9(direction, context, type6, value2) : IsRef4(type6) ? FromRef12(direction, context, type6, value2) : IsTuple3(type6) ? FromTuple13(direction, context, type6, value2) : IsUnion3(type6) ? FromUnion22(direction, context, type6, value2) : Callback(direction, context, type6, value2);
}

// node_modules/typebox/build/value/codec/decode.mjs
class DecodeError extends AssertError {
  constructor(value2, errors3) {
    super("Decode", value2, errors3);
  }
}
function Assert(context, type6, value2) {
  if (!Check2(context, type6, value2))
    throw new DecodeError(value2, Errors2(context, type6, value2));
  return value2;
}
function DecodeUnsafe(context, type6, value2) {
  const sorted = exports_settings.Get().unionPrioritySort ? UnionPrioritySort(type6) : type6;
  return FromType25("Decode", context, sorted, value2);
}
var Decoder = Pipeline([
  (_context2, _type, value2) => Clone3(value2),
  (context, type6, value2) => Default(context, type6, value2),
  (context, type6, value2) => Convert(context, type6, value2),
  (context, type6, value2) => Clean(context, type6, value2),
  (context, type6, value2) => Assert(context, type6, value2),
  (context, type6, value2) => DecodeUnsafe(context, type6, value2)
]);
// node_modules/typebox/build/value/codec/encode.mjs
class EncodeError extends AssertError {
  constructor(value2, errors3) {
    super("Encode", value2, errors3);
  }
}
function Assert2(context, type6, value2) {
  if (!Check2(context, type6, value2))
    throw new EncodeError(value2, Errors2(context, type6, value2));
  return value2;
}
function EncodeUnsafe(context, type6, value2) {
  const sorted = exports_settings.Get().unionPrioritySort ? UnionPrioritySort(type6) : type6;
  return FromType25("Encode", context, sorted, value2);
}
var Encoder = Pipeline([
  (_context2, _type, value2) => Clone3(value2),
  (context, type6, value2) => EncodeUnsafe(context, type6, value2),
  (context, type6, value2) => Default(context, type6, value2),
  (context, type6, value2) => Convert(context, type6, value2),
  (context, type6, value2) => Clean(context, type6, value2),
  (context, type6, value2) => Assert2(context, type6, value2)
]);
// node_modules/typebox/build/value/codec/has.mjs
var visited = new Set;
// node_modules/typebox/build/value/parse/parse.mjs
class ParseError2 extends AssertError {
  constructor(value2, errors3) {
    super("Parse", value2, errors3);
  }
}
function Assert3(context, type6, value2) {
  if (!Check2(context, type6, value2))
    throw new ParseError2(value2, Errors2(context, type6, value2));
  return value2;
}
var Parser = Pipeline([
  (_context2, _type, value2) => Clone3(value2),
  (context, type6, value2) => Default(context, type6, value2),
  (context, type6, value2) => Convert(context, type6, value2),
  (context, type6, value2) => Clean(context, type6, value2),
  (context, type6, value2) => Assert3(context, type6, value2)
]);
// node_modules/typebox/build/value/delta/edit.mjs
var Insert2 = _Object_({
  type: Literal2("insert"),
  path: String3(),
  value: Unknown2()
});
var Update2 = Object({
  type: Literal2("update"),
  path: String3(),
  value: Unknown2()
});
var Delete2 = _Object_({
  type: Literal2("delete"),
  path: String3()
});
var Edit = Union2([Insert2, Update2, Delete2]);
// src/workflow/json-schema.ts
var MAX_SCHEMA_BYTES = 64 * 1024;
var MAX_REPORTED_ERRORS = 5;
function compileJsonSchema(schema7) {
  if (typeof schema7 !== "object" || schema7 === null || Array.isArray(schema7)) {
    return { ok: false, message: "agent() opts.schema must be a JSON Schema object." };
  }
  const root = schema7;
  if (root.type !== "object") {
    return {
      ok: false,
      message: 'agent() opts.schema must have `type: "object"` at its root — it becomes the tool\'s input schema, ' + "and a non-object root is not something a model can be asked to fill."
    };
  }
  let serialized;
  try {
    serialized = JSON.stringify(root);
  } catch {
    return { ok: false, message: "agent() opts.schema must be JSON-serializable." };
  }
  if (serialized.length > MAX_SCHEMA_BYTES) {
    return {
      ok: false,
      message: `agent() opts.schema is too large (${serialized.length} bytes; the limit is ${MAX_SCHEMA_BYTES}).`
    };
  }
  try {
    Check2(root, {});
  } catch (error4) {
    return {
      ok: false,
      message: `agent() opts.schema is not a schema this runtime can validate: ${error4 instanceof Error ? error4.message : String(error4)}`
    };
  }
  return { ok: true, compiled: { schema: root, check: (value2) => checkAgainst(root, value2) } };
}
function checkAgainst(schema7, value2) {
  let valid;
  try {
    valid = Check2(schema7, value2);
  } catch (error4) {
    return `the value could not be validated: ${error4 instanceof Error ? error4.message : String(error4)}`;
  }
  if (valid)
    return true;
  const reported = [];
  try {
    for (const error4 of Errors2(schema7, value2)) {
      const path = String(error4.instancePath ?? "");
      const where = path === "" ? "$" : `$${path.replace(/\//g, ".")}`;
      reported.push(`${where}: ${error4.message}`);
      if (reported.length >= MAX_REPORTED_ERRORS)
        break;
    }
  } catch {}
  return reported.length > 0 ? reported.join("; ") : "the value does not match the required schema";
}

// src/workflow/worker-source.ts
var DETERMINISM_PRELUDE = "const Date = (function () {" + " const RealDate = globalThis.Date;" + " const die = function (what) {" + ' throw new Error(what + " is unavailable in workflow scripts (breaks resume).' + ' Stamp results after the workflow returns, or pass timestamps via `args`.");' + " };" + ' RealDate.now = function () { return die("Date.now()"); };' + ' Math.random = function () { return die("Math.random()"); };' + " return class WorkflowDate extends RealDate {" + ' constructor() { if (arguments.length === 0) die("new Date()"); super(...arguments); }' + " };" + "})();";
var WORKER_SOURCE = `"use strict";

const { parentPort, workerData } = require("node:worker_threads");
const vm = require("node:vm");

const port = parentPort;
const ITEM_CAP = workerData.itemCap;
const PRELUDE = ${JSON.stringify(DETERMINISM_PRELUDE)};

/* ------------------------------------------------------------------ *
 * RPC to the host
 *
 * The script never touches the agent manager. Every effect leaves as a
 * "call" message and comes back as a "response", so the host owns the
 * semaphore, the caps, and the abort story.
 * ------------------------------------------------------------------ */

let nextCallId = 1;
const pendingCalls = new Map();

/**
 * Output tokens this run has spent, as last reported by the host.
 *
 * A mirror, not a tally: every response carries the host's current total, so
 * there is exactly one counter and it cannot drift. Between responses it cannot
 * be stale in any way the script could observe — tokens only accrue through
 * agents, and an agent's response is the only thing the script waits on.
 */
let spentOutput = 0;

function callHost(method, payload) {
  // Drain first, so the phase() that named this agent reaches the host ahead of
  // the agent entry rather than a tick behind it.
  flushProgress();
  return new Promise(function (resolve, reject) {
    const callId = nextCallId++;
    pendingCalls.set(callId, { resolve: resolve, reject: reject });
    port.postMessage({ type: "call", callId: callId, method: method, payload: payload });
  });
}

port.on("message", function (message) {
  if (!message || message.type !== "response") return;
  if (typeof message.spent === "number") spentOutput = message.spent;
  const waiter = pendingCalls.get(message.callId);
  if (!waiter) return;
  pendingCalls.delete(message.callId);
  if (message.ok) {
    waiter.resolve(message.value);
    return;
  }
  const error = new Error(message.error || "The workflow host rejected the call.");
  // Fatal errors are the run's, not the item's: parallel() and pipeline()
  // swallow ordinary failures into null, and a cap breach must not be
  // silently absorbed that way.
  if (message.fatal) error.workflowFatal = true;
  waiter.reject(error);
});

function isFatal(error) {
  return !!(error && typeof error === "object" && error.workflowFatal === true);
}

/* ------------------------------------------------------------------ *
 * Progress entries
 * ------------------------------------------------------------------ */

let progressQueue = [];
let flushTimer = null;

function emit(entry) {
  progressQueue.push(entry);
  // Batched on a macrotask: a fan-out emits a burst of phase/log entries in one
  // turn, and the host renders once per batch rather than once per entry.
  if (flushTimer === null) flushTimer = setTimeout(flushProgress, 0);
}

function flushProgress() {
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (progressQueue.length === 0) return;
  const batch = progressQueue;
  progressQueue = [];
  port.postMessage({ type: "progress", entries: batch });
}

/* ------------------------------------------------------------------ *
 * The JSON boundary
 *
 * Checked here rather than relying on structured clone, which happily
 * carries cycles, BigInt and Maps that the progress log and the resume
 * journal cannot represent. Rejecting loudly beats writing a journal
 * that will not replay.
 * ------------------------------------------------------------------ */

let realmObjectPrototype = null;
/**
 * The realm's own \`JSON.parse\`.
 *
 * Module-scope, not local to main(), because \`agent({ schema })\` parses its
 * result here — outside main's closure — and the object has to carry the
 * *script's* Object.prototype, not the worker's, or \`instanceof Object\` fails
 * inside the script it was handed to.
 */
let realmParse = null;

/**
 * The top-level script's scope.
 *
 * Module-scope because a nested \`workflow()\` needs the realm-native function
 * compiler that \`main()\` builds, and because the compiled child function is
 * cached per body — see {@link workflowIn}.
 */
let rootScope = null;
/**
 * The vm context every script runs in.
 *
 * Held so a nested \`workflow()\` can compile its child there. Compiled from
 * *outside* the realm, with \`vm.Script\`, because the context itself has
 * \`codeGeneration.strings\` off — the script cannot build code, but the worker
 * that owns it still can.
 */
let realmContext = null;
/** Nested invocations made so far, against \`workerData.nestedCap\`. */
let nestedCount = 0;

function boundaryError(what, path) {
  return new Error(
    "Cannot pass " + what + " across the workflow VM boundary (at " + path + ")."
  );
}

function assertBoundary(value, path, seen) {
  if (value === null) return;
  const kind = typeof value;
  if (kind === "string" || kind === "boolean") return;
  if (kind === "number") {
    if (!Number.isFinite(value)) throw boundaryError("a non-finite number", path);
    return;
  }
  if (kind === "undefined") {
    if (path === "the workflow result") return;
    throw boundaryError("undefined", path);
  }
  if (kind === "bigint") throw boundaryError("a BigInt", path);
  if (kind === "symbol") throw boundaryError("a symbol", path);
  if (kind === "function") throw boundaryError("a function", path);
  if (kind !== "object") throw boundaryError("a " + kind, path);

  if (seen.has(value)) throw boundaryError("a circular structure", path);
  seen.add(value);

  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw boundaryError("an object with symbol keys", path);
  }

  if (Array.isArray(value)) {
    const length = value.length;
    for (let i = 0; i < length; i++) {
      // A sparse array round-trips through JSON as nulls, which silently
      // changes the data. Reject instead.
      if (!Object.prototype.hasOwnProperty.call(value, i)) {
        throw boundaryError("a sparse array", path + "[" + i + "]");
      }
      assertBoundary(value[i], path + "[" + i + "]", seen);
    }
    seen.delete(value);
    return;
  }

  const prototype = Object.getPrototypeOf(value);
  // Two prototypes are legitimate: the realm's own Object.prototype (anything
  // the script built) and the worker's (arrays we hand back from parallel).
  // Everything else — Map, Set, Date, a class instance — loses meaning here.
  if (prototype !== null && prototype !== realmObjectPrototype && prototype !== Object.prototype) {
    throw boundaryError("a non-plain object", path);
  }

  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i++) {
    assertBoundary(value[keys[i]], path + "." + keys[i], seen);
  }
  seen.delete(value);
}

function checkBoundary(value, path) {
  assertBoundary(value, path, new Set());
  return value;
}

/* ------------------------------------------------------------------ *
 * Realm helpers
 *
 * parallel() and pipeline() build their result arrays in worker code, but
 * the script should get an array its own realm recognises — otherwise
 * \`result instanceof Array\` is false and \`Array.isArray\` is the only thing
 * that works. Item values are moved across untouched.
 * ------------------------------------------------------------------ */

let realmNewArray = null;
let realmPush = null;

function toRealmArray(items) {
  const array = realmNewArray();
  for (let i = 0; i < items.length; i++) realmPush(array, items[i]);
  return array;
}

function toList(value, what) {
  if (!Array.isArray(value)) throw new Error(what + " expects an array.");
  const length = value.length >>> 0;
  if (length > ITEM_CAP) {
    throw new Error(
      what + " was given " + length + " items, over the limit of " + ITEM_CAP + "."
    );
  }
  const out = [];
  for (let i = 0; i < length; i++) out.push(value[i]);
  return out;
}

function requireText(value, what) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(what + " requires a non-empty string.");
  }
  return value;
}

function optionalText(value, what) {
  if (value === undefined || value === null) return undefined;
  return requireText(value, what);
}

/**
 * Reasoning effort a child may be spawned under — pi's \`ThinkingLevel\`.
 *
 * A superset of Claude Code's five, so a script written there runs here; the
 * extra \`minimal\` is pi's own. Validated in the worker rather than the host
 * because a typo should stop the script at the call that made it, not surface
 * later as an agent that quietly ran at the wrong depth.
 */
const EFFORT_LEVELS = ["minimal", "low", "medium", "high", "xhigh", "max"];

/**
 * Every option \`agent()\` understands.
 *
 * Checked rather than ignored, because the alternative is the worst failure a
 * ported script can have. Claude Code's \`agent()\` also takes \`schema\`, and its
 * own canonical example uses it; quietly dropping it hands the script the
 * agent's raw text where it expected a validated object, and the run then dies
 * several lines later reading a field off a string. A typo behaves the same
 * way. Naming the option costs one error message and no model calls.
 */
const AGENT_OPTIONS = [
  "label",
  "phase",
  "model",
  "agentType",
  "isolation",
  "gate",
  "resume",
  "effort",
  "schema",
];

/** Claude Code options this runtime does not have, and why. */
const UNSUPPORTED_AGENT_OPTIONS = {};

/* ------------------------------------------------------------------ *
 * Script globals
 * ------------------------------------------------------------------ */

/**
 * Phase indices are allocated once for the whole run, so parent and child never
 * collide. What is per-scope is the *title to index* map: a child's
 * \`phase("Scan")\` must not resolve to the parent's "Scan".
 */
let nextPhaseIndex = 0;

/**
 * One script's view of the world.
 *
 * A nested \`workflow()\` runs in this same worker and this same vm context —
 * which is what makes it share the run's semaphore, agent counter, journal,
 * abort signal and budget without any of them being plumbed anywhere. What it
 * must NOT share is ambient phase state, so that lives here and the child's
 * globals are closures over its own scope.
 */
function makeScope(name, depth) {
  const scope = {
    name: name,
    depth: depth,
    // Prefixed into every phase title the child defines, which is the whole of
    // how a nested run reads as its own group in the progress tree — no new
    // entry type, no renderer change.
    prefix: name === undefined ? "" : "▸ " + name,
    ambientPhaseIndex: undefined,
    ambientPhaseTitle: undefined,
    phaseIndexByTitle: new Map(),
  };
  scope.agent = function (prompt, opts) {
    return agentIn(scope, prompt, opts);
  };
  scope.phase = function (title) {
    return phaseIn(scope, title);
  };
  scope.log = function (message) {
    return logIn(scope, message);
  };
  scope.workflow = function (ref, args) {
    return workflowIn(scope, ref, args);
  };
  scope.console = makeConsole(scope);
  return scope;
}

/** A scope's title for a phase: the child's own group, or the parent's bare title. */
function scopedTitle(scope, title) {
  if (scope.prefix === "") return title;
  return title === undefined ? scope.prefix : scope.prefix + " › " + title;
}

function definePhaseIn(scope, title) {
  let index = scope.phaseIndexByTitle.get(title);
  if (index !== undefined) return index;
  index = nextPhaseIndex++;
  scope.phaseIndexByTitle.set(title, index);
  emit({ type: "workflow_phase", index: index, title: scopedTitle(scope, title) });
  return index;
}

function phaseIn(scope, title) {
  const text = requireText(title, "phase(title)");
  scope.ambientPhaseIndex = definePhaseIn(scope, text);
  scope.ambientPhaseTitle = scopedTitle(scope, text);
}

function describe(value) {
  if (typeof value === "string") return value;
  // Duck-typed, not \`instanceof Error\`: an error thrown by the script belongs
  // to the vm realm, so it fails an instanceof check against the worker's.
  if (value && typeof value === "object" && typeof value.message === "string" && typeof value.stack === "string") {
    return value.message;
  }
  try {
    const json = JSON.stringify(value);
    if (json !== undefined) return json;
  } catch {
    /* cycles and BigInt fall through to String() */
  }
  return String(value);
}

/** Attribute a line to the child that wrote it; logs carry no phase of their own. */
function logPrefix(scope) {
  return scope.prefix === "" ? "" : scope.prefix + ": ";
}

function logIn(scope, message) {
  emit({ type: "workflow_log", message: logPrefix(scope) + describe(message) });
}

function makeConsole(scope) {
  const write = function () {
    const parts = [];
    for (let i = 0; i < arguments.length; i++) parts.push(describe(arguments[i]));
    emit({ type: "workflow_log", message: logPrefix(scope) + parts.join(" ") });
  };
  return { log: write, info: write, warn: write, error: write, debug: write };
}

async function agentIn(scope, prompt, opts) {
  const text = requireText(prompt, "agent(prompt)");
  const options = opts === undefined || opts === null ? {} : opts;
  if (typeof options !== "object" || Array.isArray(options)) {
    throw new Error("agent(prompt, opts) expects opts to be an object.");
  }

  for (const key of Object.keys(options)) {
    if (AGENT_OPTIONS.indexOf(key) !== -1) continue;
    const why = UNSUPPORTED_AGENT_OPTIONS[key];
    throw new Error(
      why !== undefined
        ? "agent() opts." + key + " is not supported here: " + why
        : "agent() opts." + key + " is not a recognised option. Supported: " + AGENT_OPTIONS.join(", ") + "."
    );
  }

  const label = optionalText(options.label, "agent() opts.label");
  const phaseName = optionalText(options.phase, "agent() opts.phase");
  const model = optionalText(options.model, "agent() opts.model");
  const agentType = optionalText(options.agentType, "agent() opts.agentType");
  const isolation = optionalText(options.isolation, "agent() opts.isolation");
  if (isolation !== undefined && isolation !== "worktree") {
    throw new Error("agent() opts.isolation must be \\"worktree\\".");
  }
  const gate = optionalText(options.gate, "agent() opts.gate");
  const resume = optionalText(options.resume, "agent() opts.resume");
  const effort = optionalText(options.effort, "agent() opts.effort");
  const schema = options.schema;
  if (schema !== undefined) {
    if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
      throw new Error("agent() opts.schema must be a JSON Schema object.");
    }
    // Structured clone would happily carry a Map or a cycle that neither the
    // journal key nor the tool's parameters can survive. Same check the return
    // value gets.
    checkBoundary(schema, "agent() opts.schema");
  }
  if (effort !== undefined && EFFORT_LEVELS.indexOf(effort) === -1) {
    throw new Error("agent() opts.effort must be one of: " + EFFORT_LEVELS.join(", ") + ".");
  }

  // resume revives a child that already exists, so anything describing how to
  // *start* one is not a thing this call gets to decide — the revived child
  // keeps the agent, model and tool contract it was started with. Rejecting is
  // the point: silently ignoring these opts would look like they applied.
  if (resume !== undefined) {
    if (agentType !== undefined) {
      throw new Error(
        "agent() opts.resume and opts.agentType are mutually exclusive: a resumed agent keeps the agent type it was started with."
      );
    }
    if (model !== undefined) {
      throw new Error(
        "agent() opts.resume and opts.model are mutually exclusive: a resumed agent keeps the model it was started with."
      );
    }
    if (isolation !== undefined) {
      throw new Error(
        "agent() opts.resume and opts.isolation are mutually exclusive: a resumed agent keeps the working tree it was started in."
      );
    }
    if (effort !== undefined) {
      throw new Error(
        "agent() opts.resume and opts.effort are mutually exclusive: a resumed agent keeps the reasoning effort it was started with."
      );
    }
    if (schema !== undefined) {
      throw new Error(
        "agent() opts.resume and opts.schema are mutually exclusive: a resumed child re-prompts the session it "
          + "already had, whose tool set was fixed when it started — it has no StructuredOutput tool to answer through."
      );
    }
    if (gate !== undefined) {
      throw new Error("agent() opts.gate cannot be combined with opts.resume.");
    }
  }

  // An explicit opts.phase files this agent under that phase without moving
  // the ambient one, so a stray verify step does not re-point the phases that
  // follow it.
  const phaseIndex = phaseName !== undefined ? definePhaseIn(scope, phaseName) : scope.ambientPhaseIndex;
  const phaseTitle = phaseName !== undefined ? scopedTitle(scope, phaseName) : scope.ambientPhaseTitle;

  const result = await callHost("agent", {
    prompt: text,
    label: label,
    model: model,
    agentType: agentType,
    isolation: isolation,
    phaseIndex: phaseIndex,
    phaseTitle: phaseTitle,
    gate: gate,
    resume: resume,
    effort: effort,
    schema: schema,
  });
  if (result === undefined || result === null) return null;
  if (schema === undefined) return result;
  // Parsed with the realm's own JSON.parse so the script gets an object whose
  // prototype is its own — \`x instanceof Object\` and \`x.list instanceof Array\`
  // both hold, and it survives assertBoundary if the script returns it.
  try {
    return realmParse(result);
  } catch (error) {
    logIn(scope, "agent(): the host returned a structured result that is not JSON");
    return null;
  }
}

/**
 * A barrier: every thunk starts now, and nothing past the await runs until all
 * of them have settled. A thunk that throws resolves to null rather than
 * failing its siblings — the script filters, it does not try/catch.
 */
async function parallel(thunks) {
  const list = toList(thunks, "parallel(thunks)");
  for (let i = 0; i < list.length; i++) {
    if (typeof list[i] !== "function") {
      throw new Error("parallel(thunks) expects an array of functions; item " + i + " is not one.");
    }
  }
  const settled = await Promise.all(
    list.map(async function (thunk) {
      try {
        return await thunk();
      } catch (error) {
        if (isFatal(error)) throw error;
        return null;
      }
    })
  );
  return toRealmArray(settled);
}

/**
 * No barrier between stages. Each item walks its own chain, so item A can be
 * in stage 3 while item B is still in stage 1 — which is the whole point:
 * a barrier makes every stage wait on its slowest sibling, and with agents in
 * the stages that latency is measured in minutes.
 *
 * A stage that throws drops that item to null and skips its remaining stages.
 * Every stage sees (previousResult, originalItem, index).
 */
async function pipeline(items, ...stages) {
  const list = toList(items, "pipeline(items, ...stages)");
  for (let i = 0; i < stages.length; i++) {
    if (typeof stages[i] !== "function") {
      throw new Error("pipeline(items, ...stages) expects stages to be functions; stage " + i + " is not one.");
    }
  }
  const settled = await Promise.all(
    list.map(async function (item, index) {
      let value = item;
      for (let s = 0; s < stages.length; s++) {
        try {
          value = await stages[s](value, item, index);
        } catch (error) {
          if (isFatal(error)) throw error;
          return null;
        }
      }
      return value;
    })
  );
  return toRealmArray(settled);
}

/**
 * The \`workflow(nameOrRef, args?)\` global.
 *
 * Runs another workflow inline. The child executes in *this* worker and *this*
 * vm context, as a function whose parameters shadow the globals — which is why
 * it shares the run's concurrency cap, agent counter, abort signal, journal and
 * budget without any of them being passed anywhere: there is only ever one of
 * each. What it does not share is ambient phase state, which lives on the scope.
 *
 * One level only, as in Claude Code. The child's \`workflow\` is present and
 * throws rather than absent, so the error names the limit instead of reading
 * \`workflow is not defined\`.
 */
async function workflowIn(scope, nameOrRef, args) {
  if (scope.depth > 0) {
    throw new Error(
      "workflow() cannot be nested more than one level deep — you are already inside the workflow '" +
        scope.name + "'. Call the agents inline instead."
    );
  }

  let ref;
  if (typeof nameOrRef === "string") {
    if (nameOrRef.trim() === "") throw new Error("workflow(nameOrRef) expects a non-empty name.");
    ref = { name: nameOrRef };
  } else if (nameOrRef && typeof nameOrRef === "object" && !Array.isArray(nameOrRef)) {
    const scriptPath = optionalText(nameOrRef.scriptPath, "workflow() scriptPath");
    const name = optionalText(nameOrRef.name, "workflow() name");
    if (scriptPath === undefined && name === undefined) {
      throw new Error("workflow({ ... }) expects a \`name\` or a \`scriptPath\`.");
    }
    ref = { name: name, scriptPath: scriptPath };
  } else {
    throw new Error("workflow(nameOrRef) expects a saved workflow name or { scriptPath }.");
  }

  const label = ref.name !== undefined ? ref.name : ref.scriptPath;
  if (args !== undefined) checkBoundary(args, 'workflow("' + label + '") args');

  if (nestedCount >= workerData.nestedCap) {
    // Fatal, like the agent cap: a limit that silently drops work would be
    // worse than no limit.
    const error = new Error(
      "Workflow exceeded its cap of " + workerData.nestedCap + " nested workflow() calls."
    );
    error.workflowFatal = true;
    throw error;
  }
  nestedCount++;

  let loaded;
  try {
    loaded = await callHost("workflow", ref);
  } catch (error) {
    // Resolution failures are the script's to handle — Claude Code documents
    // workflow() as throwing on an unknown name so a script can catch it.
    // Attributed, so a caught error says which reference failed.
    if (isFatal(error)) throw error;
    throw new Error('workflow("' + label + '"): ' + describe(error));
  }

  const child = makeScope(loaded.name, scope.depth + 1);
  // The child's own group, defined before its first agent so a child that never
  // calls phase() still reads as its own section rather than falling into the
  // parent's un-phased bucket.
  child.ambientPhaseIndex = definePhaseIn(child, undefined);
  child.ambientPhaseTitle = scopedTitle(child, undefined);

  let run;
  try {
    const compiled = new vm.Script(
      // \`meta\` is deliberately not a parameter: the body still opens with its
      // own \`const meta = { ... }\` (extractMeta strips only the \`export\`), so a
      // parameter of that name would collide with it.
      "(async (agent, phase, log, workflow, console, args) => {" + PRELUDE + "\\n" + loaded.body + "\\n})",
      { filename: "workflow:" + loaded.name + ".js", lineOffset: -1 }
    );
    run = compiled.runInContext(realmContext);
  } catch (error) {
    throw new Error('workflow("' + label + '"): ' + describe(error));
  }

  const value = await run(child.agent, child.phase, child.log, child.workflow, child.console, args);
  checkBoundary(value, 'the result of workflow("' + label + '")');
  return value;
}

/**
 * The \`budget\` global.
 *
 * \`total\` is permanently null, and that is the honest answer rather than a
 * stub: Claude Code fills it from the user's "+500k" directive and pi has no
 * such directive, so "no target set" is the state this runtime is always in.
 * Every pattern Claude Code documents guards on exactly that — \`while
 * (budget.total && ...)\`, \`budget.total ? ... : 5\` — so those scripts run here
 * unchanged and take the branch they were written for. Leaving \`budget\`
 * undefined instead would turn a graceful guard into a ReferenceError.
 *
 * \`spent()\` is real. It differs from Claude Code's in scope: theirs pools the
 * main loop and every workflow in the turn, ours counts this run's agents.
 */
function makeBudget() {
  return {
    total: null,
    spent: function () {
      return spentOutput;
    },
    remaining: function () {
      // Infinity, not a number, because there is no target to subtract from.
      return Infinity;
    },
  };
}

/* ------------------------------------------------------------------ *
 * Run
 * ------------------------------------------------------------------ */

async function main() {
  rootScope = makeScope(undefined, 0);
  const sandbox = {
    agent: rootScope.agent,
    parallel: parallel,
    pipeline: pipeline,
    phase: rootScope.phase,
    log: rootScope.log,
    workflow: rootScope.workflow,
    budget: makeBudget(),
    console: rootScope.console,
  };
  const context = vm.createContext(sandbox, {
    name: "workflow",
    codeGeneration: { strings: false, wasm: false },
  });

  realmObjectPrototype = vm.runInContext("Object.prototype", context);
  realmNewArray = vm.runInContext("(function () { return []; })", context);
  realmPush = vm.runInContext("(function (array, value) { array.push(value); })", context);
  realmParse = vm.runInContext("JSON.parse", context);
  realmContext = context;

  // meta and args are materialised *inside* the realm rather than injected, so
  // the script sees objects whose prototype is its own Object.prototype and
  // whose .constructor is its own Function.
  sandbox.meta = realmParse(workerData.metaJson);
  sandbox.args = workerData.argsJson === undefined ? undefined : realmParse(workerData.argsJson);

  const script = new vm.Script("(async () => {" + PRELUDE + "\\n" + workerData.body + "\\n})()", {
    filename: "workflow.js",
    // The wrapper adds exactly one line above the body; undo it so a thrown
    // error points at the line the author wrote.
    lineOffset: -1,
  });

  const value = await script.runInContext(context);
  checkBoundary(value, "the workflow result");
  flushProgress();
  port.postMessage({
    type: "complete",
    resultJson: value === undefined ? undefined : JSON.stringify(value),
  });
}

main().catch(function (error) {
  flushProgress();
  port.postMessage({
    type: "error",
    message: error && error.message ? String(error.message) : String(error),
    stack: error && error.stack ? String(error.stack) : undefined,
  });
});
`;

// src/workflow/runtime.ts
var MAX_SCRIPT_LENGTH = 524288;
var WORKFLOW_AGENT_CAP = 1000;
var WORKFLOW_ITEM_CAP = 4096;
var WORKFLOW_NESTED_CAP = 256;
var PREVIEW_LENGTH = 200;

class WorkflowRuntimeError extends Error {
}
function workflowConcurrency(cpuCount = cpus().length) {
  return Math.max(1, Math.min(16, cpuCount - 2));
}
function boundaryError(what, path) {
  return new WorkflowRuntimeError(`Cannot pass ${what} across the workflow VM boundary (at ${path}).`);
}
function walk(value2, path, seen) {
  if (value2 === null)
    return;
  const kind = typeof value2;
  if (kind === "string" || kind === "boolean")
    return;
  if (kind === "number") {
    if (!Number.isFinite(value2))
      throw boundaryError("a non-finite number", path);
    return;
  }
  if (kind === "undefined") {
    if (path === "args")
      return;
    throw boundaryError("undefined", path);
  }
  if (kind === "bigint")
    throw boundaryError("a BigInt", path);
  if (kind === "symbol")
    throw boundaryError("a symbol", path);
  if (kind === "function")
    throw boundaryError("a function", path);
  if (kind !== "object")
    throw boundaryError(`a ${kind}`, path);
  const object5 = value2;
  if (seen.has(object5))
    throw boundaryError("a circular structure", path);
  seen.add(object5);
  if (Object.getOwnPropertySymbols(object5).length > 0) {
    throw boundaryError("an object with symbol keys", path);
  }
  if (Array.isArray(object5)) {
    for (let i = 0;i < object5.length; i++) {
      if (!Object.hasOwn(object5, i))
        throw boundaryError("a sparse array", `${path}[${i}]`);
      walk(object5[i], `${path}[${i}]`, seen);
    }
    seen.delete(object5);
    return;
  }
  const prototype = Object.getPrototypeOf(object5);
  if (prototype !== null && prototype !== Object.prototype) {
    throw boundaryError("a non-plain object", path);
  }
  for (const [key, entry] of Object.entries(object5)) {
    walk(entry, `${path}.${key}`, seen);
  }
  seen.delete(object5);
}
function assertBoundarySafe(value2, path) {
  walk(value2, path, new Set);
}

class Semaphore {
  limit;
  active = 0;
  waiters = [];
  constructor(limit) {
    this.limit = limit;
  }
  acquire() {
    if (this.active < this.limit) {
      this.active++;
      return Promise.resolve();
    }
    return new Promise((resolve3) => {
      this.waiters.push(resolve3);
    });
  }
  release() {
    const next = this.waiters.shift();
    if (next)
      next();
    else
      this.active--;
  }
  drain() {
    while (this.waiters.length > 0) {
      const next = this.waiters.shift();
      next?.();
    }
  }
}
var CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
var preview = (text) => text.length <= PREVIEW_LENGTH ? text : `${text.slice(0, PREVIEW_LENGTH - 1)}…`;
function derivedLabel(prompt) {
  const line = prompt.split(`
`, 1)[0].trim();
  return line.length <= 60 ? line || "agent" : `${line.slice(0, 59)}…`;
}
function applySchema(result, compiled) {
  let parsed;
  try {
    parsed = JSON.parse(result.text ?? "");
  } catch {
    return {
      ...result,
      ok: false,
      error: "The agent did not return structured output: its answer was not JSON."
    };
  }
  const verdict = compiled.check(parsed);
  if (verdict === true)
    return result;
  return {
    ...result,
    ok: false,
    error: `The agent's answer did not match the requested schema: ${verdict}`
  };
}
async function applyGate(result, command, agentId, runGate) {
  const outcome = result.gate ?? await runGate(command, {
    agentId,
    ...result.cwd !== undefined ? { cwd: result.cwd } : {}
  });
  const { gate: _ran, ...kept } = result;
  if (outcome.ok)
    return kept;
  const { text: _discarded, ...rest5 } = kept;
  const output = outcome.output.trim();
  return { ...rest5, ok: false, error: output === "" ? `Gate command failed: ${command}` : output };
}
function unawaitedLaunchMessage(labels) {
  const list = labels.map((label) => `'${label}'`).join(", ");
  return `workflow script completed with unawaited agent launch(es): ${list}. Await or return each launch.`;
}
function validateScript(script3) {
  if (script3.length > MAX_SCRIPT_LENGTH) {
    throw new WorkflowRuntimeError(`Workflow script is ${script3.length} characters, over the limit of ${MAX_SCRIPT_LENGTH}.`);
  }
  if (CONTROL_CHARACTERS.test(script3)) {
    throw new WorkflowRuntimeError("Workflow script contains control characters. Only tab, carriage return and newline are allowed.");
  }
  return extractMeta(script3);
}
async function runWorkflow(options) {
  const { script: script3, host } = options;
  assertBoundarySafe(options.args, "args");
  const { meta, body } = validateScript(script3);
  const agentCap = options.agentCap ?? WORKFLOW_AGENT_CAP;
  const itemCap = options.itemCap ?? WORKFLOW_ITEM_CAP;
  const semaphore = new Semaphore(options.concurrency ?? workflowConcurrency());
  const progress = [];
  const inflight = new Set;
  const completedByLabel = new Map;
  const openLaunches = new Map;
  let agentCount = 0;
  let aborted = false;
  let settled = false;
  const journalEntries = options.journal?.entries ?? [];
  const recordJournal = options.journal?.append;
  const journalResumes = journalEntries.some((entry) => entry.resumed);
  let prefixIntact = journalEntries.length > 0 && !journalResumes;
  let replayedCount = 0;
  const liveAgents = new Map;
  let spentOutputTokens = 0;
  let paused = false;
  const isPaused = () => paused;
  const pauseWaiters = new Set;
  function releasePause() {
    for (const wake of [...pauseWaiters])
      wake();
    pauseWaiters.clear();
  }
  function pauseGate(live) {
    if (!paused || aborted || settled)
      return Promise.resolve();
    return new Promise((resolve3) => {
      const wake = () => {
        pauseWaiters.delete(wake);
        live.wake = undefined;
        resolve3();
      };
      live.wake = wake;
      pauseWaiters.add(wake);
    });
  }
  options.onControl?.({
    pause: () => {
      paused = true;
    },
    resume: () => {
      paused = false;
      releasePause();
    },
    isPaused: () => paused,
    skip: (index) => {
      const live = liveAgents.get(index);
      if (live === undefined || live.intent !== undefined)
        return false;
      live.intent = "skip";
      if (live.started)
        host.abortAgent(live.agentId);
      else
        live.wake?.();
      return true;
    },
    retry: (index) => {
      const live = liveAgents.get(index);
      if (live === undefined || !live.started || live.intent !== undefined)
        return false;
      live.intent = "retry";
      host.abortAgent(live.agentId);
      return true;
    }
  });
  function replayAt(index, key) {
    if (!prefixIntact)
      return;
    const entry = journalEntries[index];
    if (entry === undefined || entry.index !== index || entry.key !== key || !entry.ok) {
      prefixIntact = false;
      return;
    }
    return entry;
  }
  const worker = new Worker(WORKER_SOURCE, {
    eval: true,
    workerData: {
      body,
      metaJson: JSON.stringify(meta),
      argsJson: options.args === undefined ? undefined : JSON.stringify(options.args),
      itemCap,
      nestedCap: options.nestedCap ?? WORKFLOW_NESTED_CAP
    }
  });
  return await new Promise((resolve3) => {
    const emit = (entries) => {
      if (entries.length === 0)
        return;
      progress.push(...entries);
      options.onProgress?.(entries);
    };
    const respond = (callId, ok, value2, error4, fatal) => {
      openLaunches.delete(callId);
      if (settled)
        return;
      worker.postMessage({ type: "response", callId, ok, value: value2, error: error4, fatal, spent: spentOutputTokens });
    };
    const finish = (result) => {
      if (settled)
        return;
      settled = true;
      options.signal?.removeEventListener("abort", onAbort);
      releasePause();
      for (const agentId of inflight)
        host.abortAgent(agentId);
      inflight.clear();
      semaphore.drain();
      const settle = () => resolve3({ ...result, meta, progress, agentCount, replayedCount });
      worker.terminate().then(settle, settle);
    };
    function onAbort() {
      aborted = true;
      finish({ status: "killed", error: "Workflow aborted." });
    }
    if (options.signal) {
      if (options.signal.aborted) {
        onAbort();
        return;
      }
      options.signal.addEventListener("abort", onAbort, { once: true });
    }
    async function handleAgent(callId, payload) {
      const runGate = host.runGate?.bind(host);
      const resumeAgent2 = host.resumeAgent?.bind(host);
      if (payload.gate !== undefined && runGate === undefined) {
        respond(callId, false, undefined, "This workflow host cannot run gate commands.", true);
        return;
      }
      if (payload.resume !== undefined && resumeAgent2 === undefined) {
        respond(callId, false, undefined, "This workflow host cannot resume agents.", true);
        return;
      }
      let resumed;
      if (payload.resume !== undefined) {
        resumed = completedByLabel.get(payload.resume);
        if (resumed === undefined) {
          const known = [...completedByLabel.keys()];
          respond(callId, false, undefined, replayedCount > 0 ? `agent() opts.resume: "${payload.resume}" was replayed from the resume journal, not run, so there is ` + "no conversation in this run to continue. Re-run without resumeFromRunId." : `agent() opts.resume: no agent has completed under the label "${payload.resume}" in this run. ${known.length === 0 ? "No agent has completed yet." : `Known labels: ${known.map((label2) => `"${label2}"`).join(", ")}.`}`, true);
          return;
        }
      }
      let compiledSchema;
      if (payload.schema !== undefined) {
        const compilation = compileJsonSchema(payload.schema);
        if (!compilation.ok) {
          respond(callId, false, undefined, compilation.message, true);
          return;
        }
        compiledSchema = compilation.compiled;
      }
      if (agentCount >= agentCap) {
        respond(callId, false, undefined, `Workflow exceeded its cap of ${agentCap} agents.`, true);
        return;
      }
      const index = agentCount++;
      const agentId = resumed?.agentId ?? `wf-agent-${index}`;
      const label = payload.label ?? resumed?.label ?? derivedLabel(payload.prompt);
      const agentType = resumed?.agentType ?? payload.agentType ?? "general-purpose";
      const model = resumed !== undefined ? resumed.model : payload.model;
      const isolation = resumed !== undefined ? resumed.isolation : payload.isolation;
      openLaunches.set(callId, label);
      const base = {
        type: "workflow_agent",
        index,
        label,
        state: "start",
        agentId,
        agentType,
        promptPreview: preview(payload.prompt),
        ...model !== undefined ? { model } : {},
        ...isolation !== undefined ? { isolation } : {},
        ...payload.phaseIndex !== undefined ? { phaseIndex: payload.phaseIndex } : {},
        ...payload.phaseTitle !== undefined ? { phaseTitle: payload.phaseTitle } : {}
      };
      const queuedAt = Date.now();
      emit([{ ...base, queuedAt }]);
      const keyInput = {
        ...payload,
        schema: payload.schema !== undefined ? JSON.stringify(payload.schema) : undefined
      };
      let replayed = replayAt(index, journalKey(keyInput));
      if (replayed !== undefined && compiledSchema !== undefined) {
        const recheck = applySchema({ ok: true, text: replayed.text ?? "" }, compiledSchema);
        if (!recheck.ok) {
          prefixIntact = false;
          replayed = undefined;
        }
      }
      if (replayed !== undefined) {
        replayedCount++;
        const replayedText = replayed.text ?? "";
        const at = Date.now();
        emit([
          {
            ...base,
            queuedAt,
            startedAt: at,
            lastProgressAt: at,
            durationMs: 0,
            state: "done",
            cached: true,
            resultPreview: preview(replayedText)
          }
        ]);
        openLaunches.delete(callId);
        recordJournal?.({ index, key: replayed.key, ok: true, text: replayedText });
        respond(callId, true, replayedText);
        return;
      }
      const key = journalKey(keyInput);
      const resumeMark = payload.resume !== undefined ? { resumed: true } : {};
      const settleSkipped = (extra) => {
        recordJournal?.({ index, key, ok: false, ...resumeMark });
        emit([{ ...base, queuedAt, ...extra, state: "error", skipped: true, error: "Skipped by user." }]);
        respond(callId, true, null);
      };
      const live = { agentId, started: false };
      liveAgents.set(index, live);
      const intent = () => live.intent;
      let attempt = 1;
      try {
        for (;; ) {
          await pauseGate(live);
          if (intent() === "skip")
            return settleSkipped({});
          await semaphore.acquire();
          if (aborted || settled) {
            semaphore.release();
            respond(callId, false, undefined, "Workflow aborted.", true);
            return;
          }
          if (isPaused() && !aborted && !settled) {
            semaphore.release();
            continue;
          }
          if (intent() === "skip") {
            semaphore.release();
            return settleSkipped({});
          }
          const attemptMark = attempt > 1 ? { attempt, lastAttemptReason: "user-retry" } : {};
          const startedAt = Date.now();
          emit([{ ...base, queuedAt, startedAt, ...attemptMark }]);
          const onResolved = (info) => {
            if (info.recordId !== undefined)
              base.recordId = info.recordId;
            if (info.modelName !== undefined)
              base.model = info.modelName;
            if (info.modelId !== undefined)
              base.modelId = info.modelId;
            if (info.thinking !== undefined)
              base.thinking = info.thinking;
            if (info.requestedThinking !== undefined)
              base.requestedThinking = info.requestedThinking;
            if (info.requestedModel !== undefined)
              base.requestedModel = info.requestedModel;
            if (!inflight.has(agentId))
              return;
            emit([{ ...base, queuedAt, startedAt, ...attemptMark, lastProgressAt: Date.now() }]);
          };
          live.started = true;
          inflight.add(agentId);
          let result;
          try {
            result = resumed !== undefined && resumeAgent2 !== undefined ? await resumeAgent2(resumed.agentId, payload.prompt, onResolved) : await host.spawnAgent({
              agentId,
              index,
              prompt: payload.prompt,
              label,
              agentType,
              ...model !== undefined ? { model } : {},
              ...payload.effort !== undefined ? { effort: payload.effort } : {},
              ...compiledSchema !== undefined ? { schema: compiledSchema } : {},
              ...isolation !== undefined ? { isolation } : {},
              ...payload.phaseIndex !== undefined ? { phaseIndex: payload.phaseIndex } : {},
              ...payload.phaseTitle !== undefined ? { phaseTitle: payload.phaseTitle } : {},
              ...payload.gate !== undefined ? { gate: payload.gate } : {},
              onResolved
            });
            if (result.ok) {
              completedByLabel.set(label, {
                agentId,
                label,
                agentType,
                ...model !== undefined ? { model } : {},
                ...isolation !== undefined ? { isolation } : {}
              });
              if (compiledSchema !== undefined && result.ok) {
                result = applySchema(result, compiledSchema);
              }
              if (result.ok && payload.gate !== undefined && runGate !== undefined) {
                result = await applyGate(result, payload.gate, agentId, runGate);
              }
            }
          } catch (error4) {
            result = { ok: false, error: error4 instanceof Error ? error4.message : String(error4) };
          } finally {
            inflight.delete(agentId);
            live.started = false;
            semaphore.release();
          }
          if (settled)
            return;
          if (intent() === "retry" && !aborted) {
            live.intent = undefined;
            attempt++;
            emit([{ ...base, queuedAt, attempt, lastAttemptReason: "user-retry" }]);
            continue;
          }
          spentOutputTokens += result.outputTokens ?? 0;
          const finishedAt = Date.now();
          const common = {
            ...base,
            queuedAt,
            startedAt,
            ...attemptMark,
            lastProgressAt: finishedAt,
            durationMs: finishedAt - startedAt,
            ...result.tokens !== undefined ? { tokens: result.tokens } : {},
            ...result.toolCalls !== undefined ? { toolCalls: result.toolCalls } : {}
          };
          if (result.ok) {
            const text = result.text ?? "";
            emit([{ ...common, state: "done", resultPreview: preview(text) }]);
            recordJournal?.({ index, key, ok: true, text, ...resumeMark });
            respond(callId, true, text);
            return;
          }
          recordJournal?.({ index, key, ok: false, ...resumeMark });
          emit([
            {
              ...common,
              state: "error",
              error: result.error ?? "Agent failed.",
              ...result.skipped ? { skipped: true } : {}
            }
          ]);
          respond(callId, true, null);
          return;
        }
      } finally {
        liveAgents.delete(index);
      }
    }
    async function handleLoadWorkflow(callId, ref8) {
      const loadWorkflow = host.loadWorkflow?.bind(host);
      if (loadWorkflow === undefined) {
        respond(callId, false, undefined, "This workflow host cannot run nested workflows.", true);
        return;
      }
      let source;
      try {
        source = await loadWorkflow(ref8);
      } catch (error4) {
        respond(callId, false, undefined, error4 instanceof Error ? error4.message : String(error4));
        return;
      }
      if (!source.ok) {
        respond(callId, false, undefined, source.message);
        return;
      }
      try {
        const child = validateScript(source.script);
        respond(callId, true, {
          name: child.meta.name,
          metaJson: JSON.stringify(child.meta),
          body: child.body
        });
      } catch (error4) {
        respond(callId, false, undefined, error4 instanceof Error ? error4.message : String(error4));
      }
    }
    worker.on("message", (message) => {
      if (settled)
        return;
      switch (message.type) {
        case "progress":
          emit(message.entries);
          break;
        case "call":
          if (message.method === "workflow") {
            handleLoadWorkflow(message.callId, message.payload);
            break;
          }
          if (message.method !== "agent") {
            respond(message.callId, false, undefined, `Unknown workflow host method "${message.method}".`, true);
            break;
          }
          handleAgent(message.callId, message.payload);
          break;
        case "complete": {
          const unawaited = [...openLaunches.values()];
          if (unawaited.length > 0) {
            finish({ status: "failed", error: unawaitedLaunchMessage(unawaited) });
            break;
          }
          finish({
            status: "completed",
            ...message.resultJson === undefined ? {} : { value: JSON.parse(message.resultJson) }
          });
          break;
        }
        case "error":
          finish({ status: "failed", error: message.message });
          break;
      }
    });
    worker.on("error", (error4) => {
      finish({ status: "failed", error: error4 instanceof Error ? error4.message : String(error4) });
    });
    worker.on("exit", () => {
      finish({ status: "failed", error: "Workflow worker exited before completing." });
    });
  });
}

// src/workflow/saved.ts
var WORKFLOW_EXTENSION = ".js";
function savedWorkflowRoots(cwd) {
  return [
    join11(cwd, ".pi", "workflows"),
    join11(cwd, ".agents", "workflows"),
    join11(getAgentDir8(), "workflows")
  ];
}
function readSavedWorkflow(name, cwd) {
  const trimmed = name.trim();
  if (isUnsafeName(trimmed)) {
    return {
      ok: false,
      message: `"${name}" is not a usable workflow name. Use letters, digits, dots, hyphens and underscores only ` + "— a path is what `scriptPath` is for."
    };
  }
  const roots = savedWorkflowRoots(cwd);
  for (const root of roots) {
    if (isSymlink(root))
      continue;
    const path = join11(root, `${trimmed}${WORKFLOW_EXTENSION}`);
    const script3 = safeReadFile(path);
    if (script3 === undefined)
      continue;
    if (!hasMetaDeclaration(script3)) {
      return {
        ok: false,
        message: `"${path}" is not a workflow script — it has no \`export const meta = { name, description }\` ` + "declaration. Nothing was run."
      };
    }
    return { ok: true, script: script3, path };
  }
  const known = listSavedWorkflows(cwd);
  return {
    ok: false,
    message: `No saved workflow named "${trimmed}". Looked in: ${roots.join(", ")}. ` + (known.length > 0 ? `Available: ${known.join(", ")}.` : "Save one as `<name>.js` in one of those directories, or pass `script`/`scriptPath` instead.")
  };
}
function resolveWorkflowSource(ref8, cwd) {
  const path = ref8.scriptPath?.trim();
  if (path !== undefined && path !== "") {
    const resolved = isAbsolute3(path) ? path : join11(cwd, path);
    try {
      return { ok: true, script: readFileSync8(resolved, "utf-8"), path: resolved };
    } catch (err) {
      return {
        ok: false,
        message: `Could not read workflow script "${resolved}": ${err instanceof Error ? err.message : String(err)}`
      };
    }
  }
  const name = ref8.name?.trim();
  if (name !== undefined && name !== "")
    return readSavedWorkflow(name, cwd);
  return { ok: false, message: "A workflow reference needs a `name` or a `scriptPath`." };
}
function listSavedWorkflows(cwd) {
  const names2 = new Set;
  for (const root of savedWorkflowRoots(cwd)) {
    if (!existsSync9(root) || isSymlink(root))
      continue;
    let entries;
    try {
      entries = readdirSync3(root);
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.endsWith(WORKFLOW_EXTENSION))
        continue;
      const name = entry.slice(0, -WORKFLOW_EXTENSION.length);
      if (isUnsafeName(name))
        continue;
      if (isWorkflowFile(join11(root, entry)))
        names2.add(name);
    }
  }
  return [...names2].sort();
}
function isWorkflowFile(path) {
  try {
    if (statSync3(path).size > MAX_SCRIPT_LENGTH)
      return false;
  } catch {
    return false;
  }
  const source = safeReadFile(path);
  return source !== undefined && hasMetaDeclaration(source);
}
function resolveWorkflowScript(params, cwd) {
  const path = params.scriptPath?.trim();
  if (path !== undefined && path !== "") {
    const resolved = resolveWorkflowSource({ scriptPath: path }, cwd);
    return resolved.ok ? { ok: true, script: resolved.script, scriptPath: resolved.path } : resolved;
  }
  const script3 = params.script;
  if (script3 !== undefined && script3.trim() !== "")
    return { ok: true, script: script3 };
  const name = params.name?.trim();
  if (name !== undefined && name !== "") {
    const saved = resolveWorkflowSource({ name }, cwd);
    return saved.ok ? { ok: true, script: saved.script, scriptPath: saved.path } : saved;
  }
  const known = listSavedWorkflows(cwd);
  return {
    ok: false,
    message: "Provide `script` (inline source), `scriptPath` (a file to read), or `name` (a saved workflow). " + "`scriptPath` takes precedence, then `script`, then `name`." + (known.length > 0 ? ` Saved workflows: ${known.join(", ")}.` : "")
  };
}

// src/workflow/host.ts
var DEFAULT_GATE_TIMEOUT_MS = 10 * 60000;
function childCwd(record5) {
  const path = record5.worktree?.path;
  return path !== undefined && existsSync10(path) ? path : undefined;
}
function succeeded(record5) {
  return record5?.status === "completed" || record5?.status === "steered";
}
function resolvedInfo(record5) {
  const invocation = record5?.invocation;
  if (invocation?.modelName === undefined)
    return;
  return {
    modelName: invocation.modelName,
    modelId: invocation.modelId,
    thinking: invocation.thinking,
    requestedThinking: invocation.requestedThinking,
    requestedModel: invocation.requestedModel
  };
}
function toSpawnResult(record5) {
  const tokens = getLifetimeTotal(record5.lifetimeUsage);
  const outputTokens = record5.lifetimeUsage?.output ?? 0;
  const cwd = childCwd(record5);
  const common = {
    ...tokens > 0 ? { tokens } : {},
    ...outputTokens > 0 ? { outputTokens } : {},
    ...record5.toolUses > 0 ? { toolCalls: record5.toolUses } : {},
    ...cwd !== undefined ? { cwd } : {}
  };
  if (succeeded(record5)) {
    return {
      ...common,
      ok: true,
      text: record5.structuredJson ?? record5.result ?? "",
      ...record5.structuredRetried ? { structuredRetried: true } : {}
    };
  }
  if (record5.status === "stopped") {
    return { ...common, ok: false, skipped: true, error: record5.error ?? "Stopped." };
  }
  return { ...common, ok: false, error: record5.error ?? `Agent ${record5.status}.` };
}
var GATE_SHELL = process.platform === "win32" ? ["cmd", "/c"] : ["sh", "-c"];
function createWorkflowHost(deps) {
  const { pi, ctx, manager } = deps;
  const records = new Map;
  const warnedScopeMessages = new Set;
  async function executeGate(command, cwd) {
    const result = await pi.exec(GATE_SHELL[0], [GATE_SHELL[1], command], {
      cwd,
      timeout: deps.gateTimeoutMs ?? DEFAULT_GATE_TIMEOUT_MS,
      ...deps.signal !== undefined ? { signal: deps.signal } : {}
    });
    const output = [result.stdout, result.stderr].map((stream) => stream.trim()).filter(Boolean).join(`
`);
    if (result.killed) {
      return { ok: false, output: output || `Gate command timed out: ${command}` };
    }
    return { ok: result.code === 0, output };
  }
  return {
    async spawnAgent(request) {
      const dispatch = resolveSpawnType(request.agentType);
      if (!dispatch.ok)
        return { ok: false, error: dispatch.message };
      let model = ctx.model;
      const config = getAgentConfig(dispatch.type);
      const modelInput = request.model ?? config?.model;
      if (modelInput !== undefined) {
        const resolved = resolveModel(modelInput, ctx.modelRegistry);
        if (typeof resolved === "string") {
          if (request.model !== undefined)
            return { ok: false, error: resolved };
        } else {
          model = resolved;
        }
      }
      const scopeVerdict = checkModelScope({
        model,
        cwd: ctx.cwd,
        modelRegistry: ctx.modelRegistry,
        callerSupplied: request.model !== undefined,
        agentLabel: config?.displayName ?? dispatch.type,
        modelInput
      });
      if (scopeVerdict.kind === "error")
        return { ok: false, error: scopeVerdict.message };
      if (scopeVerdict.kind === "warn" && !warnedScopeMessages.has(scopeVerdict.message)) {
        warnedScopeMessages.add(scopeVerdict.message);
        ctx.ui.notify(scopeVerdict.message, "warning");
      }
      let gate;
      let spawnedId;
      let sessionReady = false;
      const reportResolved = () => {
        if (!sessionReady || spawnedId === undefined)
          return;
        const info = resolvedInfo(manager.getRecord(spawnedId));
        if (info !== undefined)
          request.onResolved?.(info);
      };
      const command = request.gate;
      const onBeforeWorktreeCleanup = command === undefined ? undefined : async (worktreePath) => {
        if (spawnedId === undefined || !succeeded(manager.getRecord(spawnedId)))
          return;
        try {
          gate = await executeGate(command, worktreePath);
        } catch (error4) {
          gate = { ok: false, output: error4 instanceof Error ? error4.message : String(error4) };
        }
      };
      try {
        const { record: record5 } = await manager.spawnAndWait(pi, ctx, dispatch.type, request.prompt, {
          description: request.label,
          ...deps.workflowId !== undefined ? { workflowId: deps.workflowId } : {},
          ...model !== undefined ? { model } : {},
          ...request.effort !== undefined ? { thinkingLevel: request.effort } : {},
          invocation: {
            ...request.effort !== undefined ? { thinking: request.effort } : {}
          },
          onSessionCreated: () => {
            sessionReady = true;
            reportResolved();
          },
          ...request.schema !== undefined ? { structuredOutput: request.schema } : {},
          ...request.isolation !== undefined ? { isolation: request.isolation } : {},
          ...deps.signal !== undefined ? { signal: deps.signal } : {},
          ...deps.rootSessionId !== undefined ? { rootSessionId: deps.rootSessionId } : {},
          ...onBeforeWorktreeCleanup !== undefined ? { onBeforeWorktreeCleanup } : {}
        }, (id2) => {
          spawnedId = id2;
          records.set(request.agentId, id2);
          request.onResolved?.({ recordId: id2 });
          reportResolved();
        });
        return { ...toSpawnResult(record5), ...gate !== undefined ? { gate } : {} };
      } catch (error4) {
        return { ok: false, error: error4 instanceof Error ? error4.message : String(error4) };
      }
    },
    abortAgent(agentId) {
      const id2 = records.get(agentId);
      if (id2 !== undefined)
        manager.abort(id2);
    },
    async resumeAgent(agentId, prompt, onResolved) {
      const id2 = records.get(agentId);
      if (id2 === undefined) {
        return { ok: false, error: `Cannot resume "${agentId}" — it never started.` };
      }
      const record5 = await manager.resume(id2, prompt, deps.signal);
      if (record5 === undefined) {
        return {
          ok: false,
          error: `Agent ${id2} has no session left to resume — records are dropped ten minutes after they finish.`
        };
      }
      onResolved?.({ recordId: id2 });
      const info = resolvedInfo(record5);
      if (info !== undefined)
        onResolved?.(info);
      return toSpawnResult(record5);
    },
    loadWorkflow(ref8) {
      return resolveWorkflowSource(ref8, ctx.cwd);
    },
    async runGate(command, gate) {
      return await executeGate(command, gate.cwd ?? ctx.cwd);
    }
  };
}

// src/workflow/tool-description.ts
var fullWorkflowToolDescription = `Execute a workflow script that orchestrates multiple subagents deterministically. Workflows run in the background — this tool returns immediately with a task ID, and you are notified when the workflow completes. Use /agents → Workflows to watch live progress.

A workflow structures work across many agents — to be comprehensive (decompose and cover in parallel), to be confident (independent perspectives and adversarial checks before committing), or to take on scale one context can't hold (migrations, audits, broad sweeps). The script is where you encode that structure: what fans out, what verifies, what synthesizes.

ONLY call this tool when the user has explicitly opted into multi-agent orchestration. Workflows can spawn dozens of agents and consume a large amount of tokens; the user must request that scale, not have it inferred. Explicit opt-in means one of:
- The user directly asked you to run a workflow or use multi-agent orchestration in their own words ("use a workflow", "run a workflow", "fan out agents", "orchestrate this with subagents"). The ask must be in the user's words — a task that would merely benefit from a workflow does not count.
- The user invoked a skill or slash command whose instructions tell you to call SubagentWorkflow.
- The user asked you to run a specific named or saved workflow.

For any other task — even one that would clearly benefit from parallelism — do NOT call this tool. Use the Agent tool for individual subagents, or briefly describe what a multi-agent workflow could do and how much it would roughly cost, and ask the user whether to run it. Mention they can ask for one with "use a workflow" in a future message to skip the ask.

When you do call it, the right move is often **hybrid**: scout inline first (list the files, find the channels, scope the diff) to discover the work-list, then call SubagentWorkflow to pipeline over it. You don't need to know the shape before the *task* — only before the *orchestration step*.

Common single-phase workflows you can chain across turns:
- **Understand** — parallel readers over relevant subsystems → structured map
- **Design** — judge panel of N independent approaches → scored synthesis
- **Review** — dimensions → find → adversarially verify (example below)
- **Research** — multi-modal sweep → deep-read → synthesize
- **Migrate** — discover sites → transform each (worktree isolation) → verify

For larger work, run several in sequence — read each result before deciding the next phase. You stay in the loop; each workflow is one well-scoped fan-out.

Pass the script inline via \`script\` — do not Write it to a file first. Every invocation automatically persists its script to a file under the session directory and returns the path in the tool result. To iterate on a workflow, edit that file with Write/Edit and re-invoke SubagentWorkflow with \`{scriptPath: "<path>"}\` instead of resending the full script. A script you will run more than once belongs in \`.pi/workflows/<name>.js\` (or \`.agents/workflows/\`, or \`<agent dir>/workflows/\` for one that follows the user everywhere); call it with \`name: "<name>"\` instead of re-sending the source.

Every script must begin with \`export const meta = {...}\`:
  export const meta = {
    name: 'find-flaky-tests',
    description: 'Find flaky tests and propose fixes',   // one-line, shown in permission dialog
    phases: [                                            // one entry per phase() call
      { title: 'Scan', detail: 'grep test logs for retries' },
      { title: 'Fix', detail: 'one agent per flaky test' },
    ],
  }
  // script body starts here — use agent()/parallel()/pipeline()/phase()/log()
  phase('Scan')
  const flaky = await agent('grep CI logs for retry markers', {schema: FLAKY_SCHEMA})
  ...

The \`meta\` object must be a PURE LITERAL — no variables, function calls, spreads, or template interpolation. Required fields: \`name\`, \`description\`. Optional: \`whenToUse\` (shown in the workflow list), \`phases\`. Use the SAME phase titles in meta.phases as in phase() calls — titles are matched exactly; a phase() call with no matching meta entry just gets its own progress group. Add \`model\` to a phase entry when that phase uses a specific model override.

Script body hooks:
- agent(prompt: string, opts?: {label?: string, phase?: string, schema?: object, model?: string, effort?: string, isolation?: 'worktree', agentType?: string, gate?: string, resume?: string}): Promise<any> — spawn a subagent. Without schema, returns its final text as a string. With schema (a JSON Schema), the subagent is given a StructuredOutput tool built from it and agent() returns the validated object — no parsing needed. A payload that does not match is rejected back to the child, which corrects it; a child that never answers through the tool gets one more prompt and then fails, so the call returns null — filter after every schema stage. Returns null if the user skips the agent mid-run or the subagent dies on a terminal API error after retries (filter with .filter(Boolean)). opts.label overrides the display label. opts.phase explicitly assigns this agent to a progress group (use this inside pipeline()/parallel() stages to avoid races on the global phase() state — same phase string → same group box). opts.model overrides the model for this agent call. Default to omitting it — the agent inherits the main-loop model (the resolved session model), which is almost always correct. Only set it when you're highly confident a different tier fits the task; when unsure, omit. opts.effort overrides the reasoning effort for this agent call ('minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max') — omit to inherit the agent definition's own level, then the parent's; use 'low' for cheap mechanical stages and higher tiers only for the hardest verify/judge stages. opts.isolation: 'worktree' runs the agent in a fresh git worktree — EXPENSIVE (setup time + disk per agent), use ONLY when agents mutate files in parallel and would otherwise conflict; the worktree is removed when the agent settles, its changes preserved on a branch. opts.gate: '<command>' runs a shell command after the agent finishes and requires it to pass — a non-zero exit marks the agent failed and the command's output becomes the error; prefer gate: 'npm test' over asking another agent whether the code looks right. opts.resume: '<label>' continues the child that ran under that label instead of starting fresh, so an iterative loop keeps its context — it cannot be combined with agentType, model, effort, isolation, gate or schema. opts.agentType uses a custom subagent type instead of the default workflow subagent — resolved from the same registry as the Agent tool; composes with schema. Available types:
{{typeList}}
- pipeline(items, stage1, stage2, ...): Promise<any[]> — run each item through all stages independently, NO barrier between stages. Item A can be in stage 3 while item B is still in stage 1. This is the DEFAULT for multi-stage work. Wall-clock = slowest single-item chain, not sum-of-slowest-per-stage. Every stage callback receives (prevResult, originalItem, index) — use originalItem/index in later stages to label work without threading context through stage 1's return value. A stage that throws drops that item to \`null\` and skips its remaining stages.
- parallel(thunks: Array<() => Promise<any>>): Promise<any[]> — run tasks concurrently. This is a BARRIER: awaits all thunks before returning. A thunk that throws (or whose agent errors) resolves to \`null\` in the result array, so \`.filter(Boolean)\` before using the results; only a fatal run error — a cap breach, or a nested workflow that could not load — propagates instead of being folded into a null. Use ONLY when you genuinely need all results together.
- log(message: string): void — emit a progress message to the user (shown as a narrator line above the progress tree)
- phase(title: string): void — start a new phase; subsequent agent() calls are grouped under this title in the progress display
- args: any — the value passed as SubagentWorkflow's \`args\` input, verbatim (undefined if not provided). Pass arrays/objects as actual JSON values in the tool call, NOT as a JSON-encoded string — \`args: ["a.ts", "b.ts"]\`, not \`args: "[\\"a.ts\\", ...]"\` (a stringified list reaches the script as one string, so \`args.filter\`/\`args.map\` throw). Use this to parameterize named workflows — e.g. pass a research question, target path, or config object directly instead of via a side-channel file.
- budget: {total: number|null, spent(): number, remaining(): number} — \`budget.total\` is always null here: it comes from a token-target directive pi does not have, so guards like \`while (budget.total && budget.remaining() > 50_000) { ... }\` correctly do not fire rather than throwing on a missing global. \`budget.spent()\` returns output tokens spent by this run's agents. \`budget.remaining()\` returns \`Infinity\` with no target.
- workflow(nameOrRef: string | {scriptPath: string}, args?: any): Promise<any> — run another workflow inline as a sub-step and return whatever it returns. Pass a name to invoke a saved workflow (same registry as {name: "..."}), or {scriptPath} to run a script file you Wrote earlier. The child shares this run's concurrency cap, agent counter, abort signal, and token budget — its agents appear under a "▸ name" group in /agents → Workflows and its tokens count toward budget.spent(). The args param becomes the child's \`args\` global. Nesting is one level only: workflow() inside a child throws. Throws on unknown name / unreadable scriptPath / child syntax error; catch to handle gracefully.

Any agent() option not listed above is rejected by name at the call.

Subagents are told their final text IS the return value (not a human-facing message), so they return raw data. For structured output, use the schema option — validation happens at the tool-call layer so the model retries on mismatch.

Scripts are plain JavaScript, NOT TypeScript — type annotations (\`: string[]\`), interfaces, and generics fail to parse. The script body runs in an async context — use await directly. Standard JS built-ins (JSON, Math, Array, etc.) are available — EXCEPT \`Date.now()\`/\`Math.random()\`/argless \`new Date()\`, which throw (they would break resume); pass timestamps in via \`args\`, stamp results after the workflow returns, and for randomness vary the agent prompt/label by index. \`eval\` and \`Function(...)\` throw. No filesystem or Node.js API access.

DEFAULT TO pipeline(). Only reach for a barrier (parallel between stages) when you genuinely need ALL prior-stage results together.

A barrier is correct ONLY when stage N needs cross-item context from all of stage N-1:
- Dedup/merge across the full result set before expensive downstream work
- Early-exit if the total count is zero ("0 bugs found → skip verification entirely")
- Stage N's prompt references "the other findings" for comparison

A barrier is NOT justified by:
- "I need to flatten/map/filter first" — do it inside a pipeline stage: pipeline(items, stageA, r => transform([r]).flat(), stageB)
- "The stages are conceptually separate" — that's what pipeline() models. Separate stages ≠ synchronized stages.
- "It's cleaner code" — barrier latency is real. If 5 finders run and the slowest takes 3× the fastest, a barrier wastes 2/3 of the fast finders' idle time.

Smell test: if you wrote
  const a = await parallel(...)
  const b = transform(a)        // flatten, map, filter — no cross-item dependency
  const c = await parallel(b.map(...))
that middle transform doesn't need the barrier. Rewrite as a pipeline with the transform inside a stage. When in doubt: pipeline.

Concurrent agent() calls are capped at min(16, available CPUs - 2) per workflow — excess calls queue and run as slots free up. You can still pass 100 items to parallel()/pipeline() and they all complete; only ~10 run at any moment. Total agent count across a workflow's lifetime is capped at 1000 — a runaway-loop backstop set far above any real workflow. A single parallel()/pipeline() call accepts at most 4096 items; passing more is an explicit error, not a silent truncation.

The canonical multi-stage pattern — pipeline by default, each dimension verifies as soon as its review completes:
  export const meta = {
    name: 'review-changes',
    description: 'Review changed files across dimensions, verify each finding',
    phases: [{ title: 'Review' }, { title: 'Verify' }],
  }
  const DIMENSIONS = [{key: 'bugs', prompt: '...'}, {key: 'perf', prompt: '...'}]
  const results = await pipeline(
    DIMENSIONS,
    d => agent(d.prompt, {label: \`review:\${d.key}\`, phase: 'Review', schema: FINDINGS_SCHEMA}),
    review => parallel(review.findings.map(f => () =>
      agent(\`Adversarially verify: \${f.title}\`, {label: \`verify:\${f.file}\`, phase: 'Verify', schema: VERDICT_SCHEMA})
        .then(v => ({...f, verdict: v}))
    ))
  )
  const confirmed = results.flat().filter(Boolean).filter(f => f.verdict?.isReal)
  return { confirmed }
  // Dimension 'bugs' findings verify while dimension 'perf' is still reviewing. No wasted wall-clock.

When a barrier IS correct — dedup across all findings before expensive verification:
  const all = await parallel(DIMENSIONS.map(d => () => agent(d.prompt, {schema: FINDINGS_SCHEMA})))
  const deduped = dedupeByFileAndLine(all.filter(Boolean).flatMap(r => r.findings))  // <-- genuinely needs ALL at once
  const verified = await parallel(deduped.map(f => () => agent(verifyPrompt(f), {schema: VERDICT_SCHEMA})))

Loop-until-count pattern — accumulate to a target:
  const bugs = []
  while (bugs.length < 10) {
    const result = await agent("Find bugs in this codebase.", {schema: BUGS_SCHEMA})
    bugs.push(...result.bugs)
    log(\`\${bugs.length}/10 found\`)
  }

Gate-and-retry pattern — verify by running, and keep the agent's context across attempts:
  let fixed = await agent('Find and fix the failing test.', {label: 'fix', gate: 'npm test'})
  if (fixed === null) {                        // a non-zero exit failed the agent
    // Resume keeps everything the child already learned. It cannot carry the
    // gate, so re-verification needs its own gated call, in the same tree.
    fixed = await agent('\`npm test\` is still failing. Fix the cause.', {label: 'fix', resume: 'fix'})
    const verified = await agent('Run \`npm test\` and report the result. Change nothing.',
      {label: 'verify', phase: 'Verify', gate: 'npm test', effort: 'low'})
    return { passed: verified !== null, summary: fixed }
  }
  return { passed: true, summary: fixed }
  // An LLM judging whether a fix works is a weaker signal than the test suite.

Composing patterns — exhaustive review (find → dedup vs seen → diverse-lens panel → loop-until-dry):
  const seen = new Set(), confirmed = []
  let dry = 0
  while (dry < 2) {                                              // loop-until-dry
    const found = (await parallel(FINDERS.map(f => () =>          // barrier: collect all finders this round
      agent(f.prompt, {phase: 'Find', schema: BUGS})))).filter(Boolean).flatMap(r => r.bugs)
    const fresh = found.filter(b => !seen.has(key(b)))           // dedup vs ALL seen — plain code, not an agent
    if (!fresh.length) { dry++; continue }
    dry = 0; fresh.forEach(b => seen.add(key(b)))
    const judged = await parallel(fresh.map(b => () =>           // every fresh bug judged concurrently...
      parallel(['correctness','security','repro'].map(lens => () =>   // ...each by 3 distinct lenses
        agent(\`Judge "\${b.desc}" via the \${lens} lens — real?\`, {phase: 'Verify', schema: VERDICT})))
        .then(vs => ({ b, real: vs.filter(Boolean).filter(v => v.real).length >= 2 }))))
    confirmed.push(...judged.filter(v => v.real).map(v => v.b))
  }
  return confirmed
  // dedup vs \`seen\`, NOT \`confirmed\` — else judge-rejected findings reappear every round and it never converges.

Quality patterns — common shapes; pick by task and compose freely:
- Adversarial verify: spawn N independent skeptics per finding, each prompted to REFUTE. Kill if ≥majority refute. Prevents plausible-but-wrong findings from surviving.
    const votes = await parallel(Array.from({length: 3}, () => () =>
      agent(\`Try to refute: \${claim}. Default to refuted=true if uncertain.\`, {schema: VERDICT})))
    const survives = votes.filter(Boolean).filter(v => !v.refuted).length >= 2
- Verify by running, not by asking: when a claim is testable, \`gate\` it rather than asking another model whether it holds.
- Perspective-diverse verify: when a finding can fail in more than one way, give each verifier a distinct lens (correctness, security, perf, does-it-reproduce) instead of N identical refuters — diversity catches failure modes redundancy can't.
- Judge panel: generate N independent attempts from different angles (e.g. MVP-first, risk-first, user-first), score with parallel judges, synthesize from the winner while grafting the best ideas from runners-up. Beats one-attempt-iterated when the solution space is wide.
- Loop-until-dry: for unknown-size discovery (bugs, issues, edge cases), keep spawning finders until K consecutive rounds return nothing new. Simple counters (while count < N) miss the tail.
- Multi-modal sweep: parallel agents each searching a different way (by-container, by-content, by-entity, by-time). Each is blind to what the others surface; useful when one search angle won't find everything.
- Completeness critic: a final agent that asks "what's missing — modality not run, claim unverified, source unread?" What it finds becomes the next round of work.
- No silent caps: if a workflow bounds coverage (top-N, no-retry, sampling), \`log()\` what was dropped — silent truncation reads as "covered everything" when it didn't.

Scale to what the user asked for. "find any bugs" → a few finders, single-vote verify. "thoroughly audit this" or "be comprehensive" → larger finder pool, 3–5 vote adversarial pass, synthesis stage. When unsure, lean toward thoroughness for research/review/audit requests and toward brevity for quick checks.

These patterns aren't exhaustive — compose novel harnesses when the task calls for it (tournament brackets, self-repair loops, staged escalation, whatever fits).

Use this tool for multi-step orchestration where control flow should be deterministic (loops, conditionals, fan-out) rather than model-driven.

## Resume

The tool result includes a runId. To resume after a pause, kill, or script edit, relaunch with SubagentWorkflow({scriptPath, resumeFromRunId}) — the longest unchanged prefix of agent() calls returns cached results instantly; the first edited/new call and everything after it runs live. Same script + same args → 100% cache hit. It is a prefix and not a lookup: a later call that still matches is not reused once an earlier one has changed. A journaled failure ends the prefix, so resuming a run that died at agent 5 retries exactly agent 5. Same session only, and the run must have finished — stop it from /agents → Workflows first. Before diagnosing why a completed workflow returned an empty or unexpected result, Read the run's \`<run id>.workflow.jsonl\` beside its script — it records each agent's actual return value; do not assume cached results are non-empty. Date.now()/Math.random()/new Date() are unavailable in scripts (they would break this) — stamp results after the workflow returns, or pass timestamps via args.`;

// src/index.ts
init_worktree();
function textResult2(msg, details) {
  return { content: [{ type: "text", text: msg }], details };
}
function renderRunningAgentStatus(frame, statsText, activity, theme) {
  const container = new Container;
  container.addChild(new Text2(theme.fg("accent", frame) + (statsText ? " " + statsText : ""), 0, 0));
  container.addChild(new Text2(theme.fg("dim", `  ⎿  ${activity}`), 0, 0));
  return container;
}
function formatLifetimeTokens(o) {
  const t = getLifetimeTotal(o.lifetimeUsage);
  return t > 0 ? formatTokens(t) : "";
}
function createActivityTracker(maxTurns, onStreamUpdate) {
  const state = {
    activeTools: new Map,
    toolUses: 0,
    turnCount: 1,
    maxTurns,
    responseText: "",
    session: undefined
  };
  const callbacks = {
    onToolActivity: (activity) => {
      if (activity.type === "start") {
        state.activeTools.set(activity.toolName + "_" + Date.now(), activity.toolName);
      } else {
        for (const [key, name] of state.activeTools) {
          if (name === activity.toolName) {
            state.activeTools.delete(key);
            break;
          }
        }
        state.toolUses++;
      }
      onStreamUpdate?.();
    },
    onTextDelta: (_delta, fullText) => {
      state.responseText = fullText;
      onStreamUpdate?.();
    },
    onTurnEnd: (turnCount) => {
      state.turnCount = turnCount;
      onStreamUpdate?.();
    },
    onSessionCreated: (session) => {
      state.session = session;
    },
    onAssistantUsage: (_usage) => {
      onStreamUpdate?.();
    }
  };
  return { state, callbacks };
}
var THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
function getStatusLabel(status, error4) {
  switch (status) {
    case "error":
      return `Error: ${error4 ?? "unknown"}`;
    case "aborted":
      return "Aborted (max turns exceeded)";
    case "steered":
      return "Wrapped up (turn limit)";
    case "stopped":
      return "Stopped";
    default:
      return "Done";
  }
}
function formatTaskNotification(record5, resultMaxLen, showCost = false) {
  const status = getStatusLabel(record5.status, record5.error);
  const durationMs = record5.completedAt ? record5.completedAt - record5.startedAt : 0;
  const totalTokens = getLifetimeTotal(record5.lifetimeUsage);
  const contextPercent = getSessionContextPercent(record5.session);
  const ctxXml = contextPercent !== null ? `<context_percent>${Math.round(contextPercent)}</context_percent>` : "";
  const compactXml = record5.compactionCount ? `<compactions>${record5.compactionCount}</compactions>` : "";
  const cost = showCost ? getLifetimeCost(record5.lifetimeUsage) : 0;
  const costXml = cost > 0 ? `<estimated_cost_usd>${cost.toFixed(4)}</estimated_cost_usd>` : "";
  const resultPreview = record5.result ? record5.result.length > resultMaxLen ? record5.result.slice(0, resultMaxLen) + `
...(truncated, use get_subagent_result for full output)` : record5.result : "No output.";
  return [
    `<task-notification>`,
    `<task-id>${record5.id}</task-id>`,
    record5.toolCallId ? `<tool-use-id>${escapeXml(record5.toolCallId)}</tool-use-id>` : null,
    record5.outputFile ? `<output-file>${escapeXml(record5.outputFile)}</output-file>` : null,
    `<status>${escapeXml(status)}</status>`,
    `<summary>Agent "${escapeXml(record5.description)}" ${record5.status}${getStatusNote(record5.status)}</summary>`,
    `<result>${escapeXml(resultPreview)}</result>`,
    `<usage><total_tokens>${totalTokens}</total_tokens><tool_uses>${record5.toolUses}</tool_uses>${ctxXml}${compactXml}${costXml}<duration_ms>${durationMs}</duration_ms></usage>`,
    `</task-notification>`
  ].filter(Boolean).join(`
`);
}
function buildDetails(base, record5, activity, overrides) {
  return {
    ...base,
    toolUses: record5.toolUses,
    tokens: formatLifetimeTokens(record5),
    cost: getLifetimeCost(record5.lifetimeUsage),
    turnCount: activity?.turnCount,
    maxTurns: activity?.maxTurns,
    durationMs: (record5.completedAt ?? Date.now()) - record5.startedAt,
    status: record5.status,
    agentId: record5.id,
    error: record5.error,
    ...overrides
  };
}
function buildNotificationDetails(record5, resultMaxLen, activity) {
  const totalTokens = getLifetimeTotal(record5.lifetimeUsage);
  return {
    id: record5.id,
    description: record5.description,
    status: record5.status,
    toolUses: record5.toolUses,
    turnCount: activity?.turnCount ?? 0,
    maxTurns: activity?.maxTurns,
    totalTokens,
    totalCost: getLifetimeCost(record5.lifetimeUsage),
    durationMs: record5.completedAt ? record5.completedAt - record5.startedAt : 0,
    outputFile: record5.outputFile,
    error: record5.error,
    resultPreview: record5.result ? record5.result.length > resultMaxLen ? record5.result.slice(0, resultMaxLen) + "…" : record5.result : "No output."
  };
}
function formatToolsSuffix(cfg) {
  const tools = cfg?.builtinToolNames;
  if (!tools)
    return "*";
  if (tools.length === 0) {
    const noExtensionTools = cfg?.isolated === true || cfg?.extensions === false;
    return noExtensionTools ? "none" : "no built-ins, extension tools only";
  }
  const isFullSet = tools.length === BUILTIN_TOOL_NAMES.length && BUILTIN_TOOL_NAMES.every((t) => tools.includes(t));
  return isFullSet ? "*" : tools.join(", ");
}
var WORKFLOW_FILE_FLAG = "subagents-workflow-file";
function src_default(pi) {
  if (inChildSessionContext())
    return;
  pi.registerMessageRenderer("subagent-notification", (message, { expanded }, theme) => {
    const d = message.details;
    if (!d)
      return;
    function renderOne(d2) {
      const isError = d2.status === "error" || d2.status === "stopped" || d2.status === "aborted";
      const icon = isError ? theme.fg("error", "✗") : theme.fg("success", "✓");
      const statusText = isError ? d2.status : d2.status === "steered" ? "completed (steered)" : "completed";
      let line = `${icon} ${theme.bold(d2.description)} ${theme.fg("dim", statusText)}`;
      const parts = [];
      if (d2.turnCount > 0)
        parts.push(formatTurns(d2.turnCount, d2.maxTurns));
      if (d2.toolUses > 0)
        parts.push(`${d2.toolUses} tool use${d2.toolUses === 1 ? "" : "s"}`);
      if (d2.totalTokens > 0)
        parts.push(formatTokens(d2.totalTokens));
      if (showCost) {
        const costText = formatCost(d2.totalCost ?? 0);
        if (costText)
          parts.push(costText);
      }
      if (d2.durationMs > 0)
        parts.push(formatMs(d2.durationMs));
      if (parts.length) {
        line += `
  ` + parts.map((p2) => theme.fg("dim", p2)).join(" " + theme.fg("dim", "·") + " ");
      }
      if (expanded) {
        const lines = d2.resultPreview.split(`
`).slice(0, 30);
        for (const l of lines)
          line += `
` + theme.fg("dim", `  ${l}`);
      } else {
        const preview2 = d2.resultPreview.split(`
`)[0]?.slice(0, 80) ?? "";
        line += `
  ` + theme.fg("dim", `⎿  ${preview2}`);
      }
      if (d2.outputFile) {
        line += `
  ` + theme.fg("muted", `transcript: ${d2.outputFile}`);
      }
      return line;
    }
    const all = [d, ...d.others ?? []];
    const rendered = all.map(renderOne);
    if (showCost && all.length > 1) {
      const total = formatCost(all.reduce((sum, a) => sum + (a.totalCost ?? 0), 0));
      if (total) {
        const tokens = all.reduce((sum, a) => sum + a.totalTokens, 0);
        rendered.unshift(theme.fg("dim", `${all.length} agents · ${formatTokens(tokens)} · ${total}`));
      }
    }
    return new Text2(rendered.join(`
`), 0, 0);
  });
  pi.registerEntryRenderer(WORKFLOW_ENTRY_TYPE, (entry, _options, theme) => renderWorkflowEntryCard(entry.data, theme));
  pi.registerFlag(WORKFLOW_FILE_FLAG, {
    type: "string",
    description: `Run a workflow script at startup: --${WORKFLOW_FILE_FLAG}=<path>. ` + "Use the `=` form — the space form consumes the next argument, which would swallow a following prompt."
  });
  let strictAgentFiles = loadSettings(process.cwd()).strictAgentFiles === true;
  const reloadCustomAgents = (strict = false) => {
    const userAgents = loadCustomAgents(process.cwd(), strict);
    registerAgents(userAgents);
  };
  reloadCustomAgents(strictAgentFiles);
  let configuredAgentOverrides = {};
  const agentActivity = new Map;
  let reportUsage = false;
  function isReportUsageEnabled() {
    return reportUsage;
  }
  function setReportUsage(b2) {
    reportUsage = b2;
    if (!b2)
      pendingUsage.drain();
  }
  let showCost = false;
  function isShowCostEnabled() {
    return showCost;
  }
  function setShowCost(b2) {
    showCost = b2;
    widget.update();
    fleet.update();
  }
  let showModel = false;
  function isShowModelEnabled() {
    return showModel;
  }
  function setShowModel(b2) {
    showModel = b2;
    widget.update();
  }
  let viewerMarkdown = "assistant";
  function getViewerMarkdown() {
    return viewerMarkdown;
  }
  function setViewerMarkdown(mode) {
    viewerMarkdown = mode;
  }
  function chooseViewerMarkdown(mode, ctx) {
    setViewerMarkdown(mode);
    persistSettings(ctx, `Viewer markdown set to ${mode}`);
  }
  const pendingUsage = new PendingUsagePool;
  const pendingNudges = new Map;
  const NUDGE_HOLD_MS = 200;
  const QUEUE_WAIT_POLL_MS = Math.floor(NUDGE_HOLD_MS / 4);
  function scheduleNudge(key, send, delay = NUDGE_HOLD_MS) {
    cancelNudge(key);
    pendingNudges.set(key, setTimeout(() => {
      pendingNudges.delete(key);
      try {
        send();
      } catch {}
    }, delay));
  }
  function cancelNudge(key) {
    const timer = pendingNudges.get(key);
    if (timer != null) {
      clearTimeout(timer);
      pendingNudges.delete(key);
    }
  }
  function emitIndividualNudge(record5) {
    if (record5.resultConsumed)
      return;
    const notification = formatTaskNotification(record5, 500, showCost);
    const footer = record5.outputFile ? `
Full transcript available at: ${record5.outputFile}` : "";
    pi.sendMessage({
      customType: "subagent-notification",
      content: notification + footer,
      display: true,
      details: buildNotificationDetails(record5, 500, agentActivity.get(record5.id))
    }, { deliverAs: "followUp", triggerTurn: true });
  }
  function sendIndividualNudge(record5) {
    agentActivity.delete(record5.id);
    widget.markFinished(record5.id);
    fleet.onAgentFinished(record5.id);
    scheduleNudge(record5.id, () => emitIndividualNudge(record5));
    widget.update();
  }
  const groupJoin = new GroupJoinManager((records, partial5) => {
    for (const r of records) {
      agentActivity.delete(r.id);
      widget.markFinished(r.id);
      fleet.onAgentFinished(r.id);
    }
    const groupKey = `group:${records.map((r) => r.id).join(",")}`;
    scheduleNudge(groupKey, () => {
      const unconsumed = records.filter((r) => !r.resultConsumed);
      if (unconsumed.length === 0) {
        widget.update();
        return;
      }
      const notifications = unconsumed.map((r) => formatTaskNotification(r, 300, showCost)).join(`

`);
      const label = partial5 ? `${unconsumed.length} agent(s) finished (partial — others still running)` : `${unconsumed.length} agent(s) finished`;
      const [first, ...rest5] = unconsumed;
      const details = buildNotificationDetails(first, 300, agentActivity.get(first.id));
      if (rest5.length > 0) {
        details.others = rest5.map((r) => buildNotificationDetails(r, 300, agentActivity.get(r.id)));
      }
      pi.sendMessage({
        customType: "subagent-notification",
        content: `Background agent group completed: ${label}

${notifications}

Use get_subagent_result for full output.`,
        display: true,
        details
      }, { deliverAs: "followUp", triggerTurn: true });
    });
    widget.update();
  }, 30000);
  function buildEventData(record5) {
    const durationMs = record5.completedAt ? record5.completedAt - record5.startedAt : Date.now() - record5.startedAt;
    const u = record5.lifetimeUsage;
    const total = getLifetimeTotal(u);
    const tokens = total > 0 ? { input: u.input, output: u.output, total } : undefined;
    const usage = toReportedUsage(u);
    return {
      id: record5.id,
      type: record5.type,
      description: record5.description,
      result: record5.result,
      error: record5.error,
      status: record5.status,
      toolUses: record5.toolUses,
      durationMs,
      tokens,
      usage
    };
  }
  const manager = new AgentManager((record5) => {
    if (!isTopLevelAgent(record5))
      return;
    const isError = record5.status === "error" || record5.status === "stopped" || record5.status === "aborted";
    const eventData = buildEventData(record5);
    if (isError) {
      pi.events.emit("subagents:failed", eventData);
    } else {
      pi.events.emit("subagents:completed", eventData);
    }
    pi.appendEntry("subagents:record", {
      id: record5.id,
      type: record5.type,
      description: record5.description,
      status: record5.status,
      result: record5.result,
      error: record5.error,
      startedAt: record5.startedAt,
      completedAt: record5.completedAt
    });
    if (record5.resultConsumed) {
      agentActivity.delete(record5.id);
      widget.markFinished(record5.id);
      fleet.onAgentFinished(record5.id);
      widget.update();
      return;
    }
    if (currentBatchAgents.some((a) => a.id === record5.id)) {
      widget.update();
      return;
    }
    const result = groupJoin.onAgentComplete(record5);
    if (result === "pass") {
      sendIndividualNudge(record5);
    }
    widget.update();
  }, undefined, (record5) => {
    if (!isTopLevelAgent(record5))
      return;
    if (currentCtx?.hasUI) {
      widget.ensureTimer();
      widget.update();
      fleet.ensureTimer();
      fleet.update();
    }
    pi.events.emit("subagents:started", {
      id: record5.id,
      type: record5.type,
      description: record5.description
    });
  }, (record5, info) => {
    if (!isTopLevelAgent(record5))
      return;
    pi.events.emit("subagents:compacted", {
      id: record5.id,
      type: record5.type,
      description: record5.description,
      reason: info.reason,
      tokensBefore: info.tokensBefore,
      compactionCount: record5.compactionCount
    });
  }, (_record, usage) => {
    if (reportUsage)
      pendingUsage.add(usage);
  });
  const MANAGER_KEY = Symbol.for("pi-subagents:manager");
  const spawnResolved = (piRef, ctxRef, type6, prompt, options) => {
    reloadCustomAgents();
    const dispatch = resolveSpawnType(type6);
    if (!dispatch.ok)
      throw new Error(dispatch.message);
    const { state, callbacks } = createActivityTracker(resolveEffectiveMaxTurns(dispatch.type, options?.maxTurns));
    const id2 = manager.spawn(piRef, ctxRef, dispatch.type, prompt, { ...options, ...callbacks });
    agentActivity.set(id2, state);
    return id2;
  };
  const spawnTopLevel = (piRef, ctxRef, type6, prompt, options) => {
    const safeOptions = { ...options ?? {} };
    delete safeOptions.parentAgentId;
    delete safeOptions.workflowId;
    delete safeOptions.depth;
    delete safeOptions.maxSubagentDepth;
    delete safeOptions.configCwd;
    delete safeOptions.rootSessionId;
    delete safeOptions.resumeSessionFile;
    delete safeOptions.reclaim;
    delete safeOptions.blocking;
    return spawnResolved(piRef, ctxRef, type6, prompt, safeOptions);
  };
  const resolveAgentRef = (ref8) => {
    const byId = manager.getRecord(ref8);
    if (byId)
      return byId;
    const resolved = manager.resolveMention(ref8);
    return resolved?.kind === "live" ? resolved.record : undefined;
  };
  const registryEntry = {
    waitForAll: () => manager.waitForAll(),
    hasRunning: () => manager.hasRunning(),
    spawn: spawnTopLevel,
    getRecord: (id2) => {
      const record5 = manager.getRecord(id2);
      return record5 !== undefined && isTopLevelAgent(record5) ? record5 : undefined;
    }
  };
  const ownsManagerRegistry = globalThis[MANAGER_KEY] === undefined;
  if (ownsManagerRegistry) {
    globalThis[MANAGER_KEY] = registryEntry;
  }
  let currentCtx;
  let rpcHandle;
  let mentionProviderRegistered = false;
  const scheduler = new SubagentScheduler;
  function startScheduler(ctx) {
    try {
      const sessionId = ctx.sessionManager?.getSessionId?.();
      if (!sessionId)
        return;
      const path = resolveStorePath(ctx.cwd, sessionId);
      const store = new ScheduleStore(path);
      scheduler.start(pi, ctx, manager, store);
      pi.events.emit("subagents:scheduler_ready", { sessionId, jobCount: store.list().length });
    } catch (err) {
      console.warn("[pi-subagents] Failed to start scheduler:", err);
    }
  }
  pi.on("session_start", async (_event, ctx) => {
    currentCtx = ctx;
    if (ctx.hasUI) {
      widget.setUICtx(ctx.ui);
      fleet.setUICtx(ctx.ui);
    }
    manager.clearCompleted(true);
    if (!rpcHandle) {
      rpcHandle = registerRpcHandlers({
        events: pi.events,
        pi,
        getCtx: () => currentCtx,
        manager: {
          spawn: spawnTopLevel,
          awaitStartup: (id2) => manager.awaitStartup(id2),
          getRecord: (id2) => manager.getRecord(id2),
          abort: (id2) => manager.abort(id2),
          consumeResult: (id2) => {
            const record5 = resolveAgentRef(id2);
            if (!record5 || record5.parentAgentId)
              return false;
            if (record5.status === "running" || record5.status === "queued")
              return false;
            record5.resultConsumed = true;
            cancelNudge(record5.id);
            return true;
          }
        }
      });
      pi.events.emit("subagents:ready", {});
    }
    if (isSchedulingEnabled() && !scheduler.isActive())
      startScheduler(ctx);
    if (ctx.mode === "tui" && !mentionProviderRegistered) {
      mentionProviderRegistered = true;
      ctx.ui.addAutocompleteProvider((current) => createMentionProvider(current, () => mentionRoster(manager, mentionTypes(), (type6) => getConfig(type6).displayName), isAgentMentionsEnabled));
    }
    resolveWorkflowCollisions(ctx);
    runWorkflowFlag(ctx);
  });
  const mentionTypes = () => getAvailableTypes().map((name) => ({ name, description: getAgentConfig(name)?.description ?? name }));
  pi.on("input", async (event, ctx) => {
    if (event.source === "extension" || !isAgentMentionsEnabled())
      return { action: "continue" };
    const canDispatchDirectly = ctx.mode === "tui";
    if (!canDispatchDirectly && getAgentMentionMode() !== "model")
      return { action: "continue" };
    const mention = parseMention(event.text);
    if (!mention)
      return { action: "continue" };
    if (isReservedHandle(mention.handle)) {
      return { action: "transform", text: mention.message, ...event.images && { images: event.images } };
    }
    const alias = stripAgentPrefix(mention.handle);
    const resolved = manager.resolveMention(mention.handle) ?? (alias ? manager.resolveMention(alias) : undefined);
    if (resolved && !canDispatchDirectly)
      return { action: "continue" };
    if (resolved?.kind === "live") {
      const record5 = resolved.record;
      const target2 = `@${record5.alias ?? record5.handle ?? mention.handle}`;
      if (record5.status === "running" || record5.status === "queued") {
        record5.resultConsumed = false;
        manager.steer(record5.id, mention.message);
        pi.events.emit("subagents:steered", { id: record5.id, message: mention.message });
        ctx.ui.notify(`Sent to ${target2}`, "info");
        return { action: "handled" };
      }
      if (record5.session) {
        const config = getAgentConfig(record5.type);
        const resumedRecord = await startBackgroundResume(ctx, record5, mention.message, {
          outputTranscript: config?.outputTranscript ?? getOutputTranscriptDefault(),
          maxTurns: normalizeMaxTurns(config?.maxTurns ?? getDefaultMaxTurns())
        });
        ctx.ui.notify(resumedRecord ? `Resuming ${target2}` : `Could not resume ${target2} — it is still running.`, resumedRecord ? "info" : "warning");
        return { action: "handled" };
      }
    }
    if (resolved?.kind === "tombstone") {
      const entry = resolved.entry;
      const target2 = `@${entry.alias ?? entry.handle}`;
      if (!existsSync11(entry.sessionFile)) {
        manager.dropTombstone(entry.handle);
        ctx.ui.notify(`Could not resume ${target2} — its session is gone.`, "warning");
        return { action: "handled" };
      }
      reloadCustomAgents();
      const dispatch = resolveSpawnType(entry.type);
      if (!dispatch.ok || dispatch.fellBackFrom !== undefined) {
        ctx.ui.notify(`Could not resume ${target2} — the ${entry.type} agent is no longer available.`, "warning");
        return { action: "handled" };
      }
      try {
        const id2 = spawnResolved(pi, ctx, dispatch.type, mention.message, {
          description: entry.description,
          reclaim: { handle: entry.handle, alias: entry.alias },
          resumeSessionFile: entry.sessionFile,
          isBackground: true
        });
        await manager.awaitStartup(id2);
        ctx.ui.notify(`Resuming ${target2}`, "info");
      } catch (err) {
        ctx.ui.notify(`Could not resume ${target2}: ${err instanceof Error ? err.message : String(err)}`, "warning");
      }
      return { action: "handled" };
    }
    const typeHandle = mention.handle;
    const type6 = resolveHandleToType(typeHandle, getAvailableTypes()) ?? (alias ? resolveHandleToType(alias, getAvailableTypes()) : undefined);
    if (!type6)
      return { action: "continue" };
    if (getAgentMentionMode() === "model") {
      const label = `@${handleBase(type6)}`;
      ctx.ui.notify(`Prompting ${label}…`, "info");
      runMentionClone({ ctx, type: type6, message: mention.message, agentTool: registeredAgentTool }).then(async (result) => {
        if (result.spawned)
          return;
        try {
          const id2 = spawnTopLevel(pi, ctx, type6, mention.message, {
            description: describeMention(mention.message),
            isBackground: true
          });
          await manager.awaitStartup(id2);
          ctx.ui.notify(`Started ${label} directly — ${result.error}`, "warning");
        } catch (err) {
          ctx.ui.notify(`Could not start ${label}: ${err instanceof Error ? err.message : String(err)}`, "error");
        }
      });
      return { action: "handled" };
    }
    try {
      const id2 = spawnTopLevel(pi, ctx, type6, mention.message, {
        description: describeMention(mention.message),
        isBackground: true
      });
      await manager.awaitStartup(id2);
      ctx.ui.notify(`Started @${handleBase(type6)}`, "info");
    } catch (err) {
      ctx.ui.notify(`Could not start @${handleBase(type6)}: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
    return { action: "handled" };
  });
  pi.on("session_before_switch", () => {
    manager.clearCompleted(true);
    scheduler.stop();
  });
  pi.on("session_shutdown", async () => {
    rpcHandle?.unsubSpawn();
    rpcHandle?.unsubStop();
    rpcHandle?.unsubPing();
    rpcHandle?.unsubConsume();
    rpcHandle = undefined;
    currentCtx = undefined;
    if (ownsManagerRegistry && globalThis[MANAGER_KEY] === registryEntry) {
      delete globalThis[MANAGER_KEY];
    }
    scheduler.stop();
    for (const task of workflowTasks.values())
      task.abortController.abort();
    workflowTasks.clear();
    manager.abortAll();
    for (const timer of pendingNudges.values())
      clearTimeout(timer);
    pendingNudges.clear();
    fleet.dispose();
    await manager.dispose(pi);
  });
  let widgetMode = "background";
  function getWidgetMode() {
    return widgetMode;
  }
  const widget = new AgentWidget(manager, agentActivity, getWidgetMode, isShowCostEnabled, isShowModelEnabled);
  function setWidgetMode(m2) {
    widgetMode = m2;
    widget.update();
  }
  const fleet = new FleetList(manager, agentActivity, isShowCostEnabled, getViewerMarkdown, (mode) => chooseViewerMarkdown(mode, currentCtx));
  let fleetViewEnabled = true;
  function isFleetViewEnabled() {
    return fleetViewEnabled;
  }
  function setFleetViewEnabled(b2) {
    fleetViewEnabled = b2;
    fleet.setEnabled(b2);
  }
  let agentMentionMode = "model";
  function getAgentMentionMode() {
    return agentMentionMode;
  }
  function setAgentMentionMode(mode) {
    agentMentionMode = mode;
  }
  function isAgentMentionsEnabled() {
    return agentMentionMode !== "off";
  }
  let defaultJoinMode = "smart";
  function getDefaultJoinMode() {
    return defaultJoinMode;
  }
  function setDefaultJoinMode(mode) {
    defaultJoinMode = mode;
  }
  let backgroundByDefault = true;
  function getBackgroundByDefault() {
    return backgroundByDefault;
  }
  function setBackgroundByDefault(b2) {
    backgroundByDefault = b2;
  }
  let schedulingEnabled = true;
  function isSchedulingEnabled() {
    return schedulingEnabled;
  }
  function setSchedulingEnabled(b2) {
    schedulingEnabled = b2;
  }
  let workflowsEnabled = true;
  let workflowsPinned = false;
  function isWorkflowsEnabled() {
    return workflowsEnabled;
  }
  function isWorkflowsPinned() {
    return workflowsPinned;
  }
  function setWorkflowsEnabled(b2) {
    workflowsEnabled = b2;
    workflowsPinned = true;
  }
  function setDisableDefaultAgents(b2) {
    setDefaultsDisabled(b2);
    reloadCustomAgents();
  }
  let toolDescriptionMode = "full";
  function getToolDescriptionMode() {
    return toolDescriptionMode;
  }
  function setToolDescriptionMode(mode) {
    toolDescriptionMode = mode;
  }
  let currentBatchAgents = [];
  let batchFinalizeTimer;
  let batchCounter = 0;
  function finalizeBatch() {
    batchFinalizeTimer = undefined;
    const batchAgents = [...currentBatchAgents];
    currentBatchAgents = [];
    const smartAgents = batchAgents.filter((a) => a.joinMode === "smart" || a.joinMode === "group");
    if (smartAgents.length >= 2) {
      const groupId = `batch-${++batchCounter}`;
      const ids = smartAgents.map((a) => a.id);
      groupJoin.registerGroup(groupId, ids);
      for (const id2 of ids) {
        const record5 = manager.getRecord(id2);
        if (!record5)
          continue;
        record5.groupId = groupId;
        if (record5.completedAt != null && !record5.resultConsumed) {
          groupJoin.onAgentComplete(record5);
        }
      }
    } else {
      for (const { id: id2 } of batchAgents) {
        const record5 = manager.getRecord(id2);
        if (record5?.completedAt != null && !record5.resultConsumed) {
          sendIndividualNudge(record5);
        }
      }
    }
  }
  async function startBackgroundResume(ctx, existing, prompt, opts) {
    const id2 = existing.id;
    const joinMode = resolveJoinMode(defaultJoinMode, true);
    existing.toolCallId = opts.toolCallId;
    if (joinMode)
      existing.joinMode = joinMode;
    if (opts.outputTranscript) {
      existing.outputFile = createOutputFilePath(ctx.cwd, id2, ctx.sessionManager.getSessionId());
      ensureOutputFile(existing.outputFile);
    }
    const transcriptAnchor = existing.session?.messages.length ?? 0;
    const { state: bgState, callbacks: bgCallbacks } = createActivityTracker(opts.maxTurns);
    bgState.session = existing.session;
    const record5 = await manager.resume(id2, prompt, undefined, {
      isBackground: true,
      onToolActivity: bgCallbacks.onToolActivity,
      onAssistantUsage: bgCallbacks.onAssistantUsage,
      onStarted: () => {
        const rec = manager.getRecord(id2);
        if (rec?.session && rec.outputFile) {
          rec.outputCleanup = streamToOutputFile(rec.session, rec.outputFile, id2, ctx.cwd, transcriptAnchor);
        }
      }
    });
    if (!record5)
      return;
    if (joinMode != null && joinMode !== "async") {
      currentBatchAgents.push({ id: id2, joinMode });
      if (batchFinalizeTimer)
        clearTimeout(batchFinalizeTimer);
      batchFinalizeTimer = setTimeout(finalizeBatch, 100);
    }
    agentActivity.set(id2, bgState);
    widget.markRunning(id2);
    widget.ensureTimer();
    widget.update();
    fleet.ensureTimer();
    fleet.update();
    pi.events.emit("subagents:created", {
      id: id2,
      type: existing.type,
      description: existing.description,
      isBackground: true
    });
    return record5;
  }
  pi.on("tool_execution_start", async (_event, ctx) => {
    widget.setUICtx(ctx.ui);
    fleet.setUICtx(ctx.ui);
    widget.onTurnStart();
  });
  const buildTypeListText = () => {
    const available = getAvailableTypes();
    return available.map((name) => {
      const cfg = getAgentConfig(name);
      const modelSuffix = cfg?.model ? ` (${getModelLabelFromConfig(cfg.model)})` : "";
      const toolsSuffix = ` (Tools: ${formatToolsSuffix(cfg)})`;
      return `- ${name}: ${cfg?.description ?? name}${modelSuffix}${toolsSuffix}`;
    }).join(`
`);
  };
  const firstSentence = (text) => {
    const match = text.match(/^.*?[.!?](?=\s|$)/s);
    return (match ? match[0] : text).replace(/\s+/g, " ").trim();
  };
  const buildCompactTypeListText = () => getAvailableTypes().map((name) => {
    const cfg = getAgentConfig(name);
    return `- ${name}: ${firstSentence(cfg?.description ?? name)} (Tools: ${formatToolsSuffix(cfg)})`;
  }).join(`
`);
  function getModelLabelFromConfig(model) {
    const name = model.includes("/") ? model.split("/").pop() : model;
    return name.replace(/-\d{8}$/, "");
  }
  applyAndEmitLoaded({
    setAgentOverrides: (overrides) => {
      configuredAgentOverrides = overrides;
      setAgentOverrides(overrides);
      reloadCustomAgents(strictAgentFiles);
    },
    setMaxConcurrent: (n) => manager.setMaxConcurrent(n),
    setMaxConcurrentForeground: (n) => manager.setMaxConcurrentForeground(n),
    setDefaultMaxTurns,
    setGraceTurns,
    setDefaultJoinMode,
    setBackgroundByDefault,
    setSchedulingEnabled,
    setScopeModels: setScopeModelsEnabled,
    setStrictAgentFiles: (b2) => {
      strictAgentFiles = b2;
    },
    setDisableDefaultAgents,
    setToolDescriptionMode,
    setFleetView: setFleetViewEnabled,
    setAgentMentions: setAgentMentionMode,
    setRememberAgents,
    setWidgetMode,
    setOutputTranscript: setOutputTranscriptDefault,
    setWorktreeIsolation: setWorktreeIsolationEnabled,
    setWorkflowsEnabled,
    setMaxSubagentDepth,
    setFallbackSubagent,
    setReportUsage,
    setShowCost,
    setShowModel,
    setViewerMarkdown
  }, (event, payload) => pi.events.emit(event, payload));
  const scheduleParamShape = {
    schedule: Type.Optional(Type.String({
      description: "Opt-in only — fire later instead of now. Omit to run immediately (the default, almost always correct). " + 'Formats: 6-field cron ("0 0 9 * * 1" = 9am Mon), interval ("5m"/"1h"), one-shot ("+10m" or ISO). ' + "Forces run_in_background; incompatible with inherit_context and resume. Returns job ID."
    }))
  };
  const scheduleParam = isSchedulingEnabled() ? scheduleParamShape : {};
  const scheduleGuideline = isSchedulingEnabled() ? `
- Use \`schedule\` only when the user explicitly asked for scheduled / recurring / delayed execution (e.g. "every Monday", "in an hour"). Don't auto-schedule from vague intent like "monitor X" — run once now or ask.` : "";
  const isolationGuideline = isWorktreeIsolationEnabled() ? `
- Use isolation: "worktree" to give the agent its own git worktree (safe parallel file modifications); leave it unset, or pass "off", for none. The worktree is removed when the agent finishes; if it made changes, they are committed to a branch and the branch is named in the result.` : "";
  const isolationCompactGuideline = isWorktreeIsolationEnabled() ? `
- isolation: "worktree" gives the agent its own git worktree (removed on completion); changes land on a branch named in the result.` : "";
  const compactAgentToolDescription = `Launch an autonomous agent for complex, multi-step tasks. Agent types:
${buildCompactTypeListText()}

Custom agents: .pi/agents/<name>.md (project) or ${getAgentDir9()}/agents/<name>.md (global).

Notes:
- description: 3-5 words (shown in UI). Prompts must be self-contained — the agent has not seen this conversation.
- Parallel work: one message, multiple Agent calls — they run concurrently.
- Subagents run in the background by default; you'll be notified when one completes. Pass run_in_background: false only when your very next action depends on the result and nothing else could usefully happen while it runs. Never fabricate or predict a pending agent's results — if the user asks before the notification arrives, say it's still running.
- The result is not shown to the user — summarize it for them. Verify an agent's claimed code changes before reporting work done.
- resume continues a previous agent by ID; steer_subagent messages a running one.${isolationCompactGuideline}`;
  const fullAgentToolDescription = `Launch a new agent to handle complex, multi-step tasks autonomously. Each agent type has specific capabilities and tools available to it.

Available agent types and the tools they have access to:
${buildTypeListText()}

Custom agents can be defined in .pi/agents/<name>.md (project) or ${getAgentDir9()}/agents/<name>.md (global) — they are picked up automatically. Project-level agents override global ones. Creating a .md file with the same name as a default agent overrides it.

When using the Agent tool, specify a subagent_type parameter to select which agent type to use.

## When not to use

If the target is already known, use a direct tool — \`read\` for a known path, \`grep\`/\`find\` for a specific symbol or string. Reserve this tool for open-ended questions that span the codebase, or tasks that match an available agent type.

## Usage notes

- Always include a short (3-5 word) description summarizing what the agent will do (shown in UI).
- When you launch multiple agents for independent work, send them in a single message with multiple tool uses so they run concurrently. If the user specifies that they want you to run agents "in parallel", you MUST send a single message with multiple Agent tool use content blocks.
- When the agent is done, it returns a single message back to you. The result is not visible to the user — to show the user, send a text message with a concise summary.
- Trust but verify: an agent's summary describes what it intended to do, not necessarily what it did. When an agent writes or edits code, check the actual changes before reporting the work as done.
- Agents run in the background by default. When an agent runs in the background, you will be automatically notified when it completes — do NOT sleep, poll, or proactively check on its progress. Continue with other work or respond to the user instead.
- **Foreground vs background**: Pass \`run_in_background: false\` only when your very next action depends on the agent's result and nothing else could usefully happen while it runs — e.g., a research agent whose finding gates the edit you're about to make. Otherwise let it run in the background (the default) — this includes fire-and-forget work, independent investigations, and anything where the user might hand you something else in the meantime. Wanting the result "next" is not enough on its own.
- **Don't race**: after launching a background agent, you know nothing about its results. Never fabricate or predict them in any format — not as prose, summary, or structured output. The completion notification arrives in a later turn; it is never something you write yourself. If the user asks before it lands, say the agent is still running — give status, not a guess.
- Use resume with an agent ID to continue a previous agent's work. A new (non-resume) Agent call starts a fresh agent with no memory of prior runs, so the prompt must be self-contained.
- Use steer_subagent to send mid-run messages to a running background agent.
- Clearly tell the agent whether you expect it to write code or just to do research (search, file reads, etc.), since it is not aware of the user's intent.
- If an agent's description says it should be used proactively, try to use it without the user having to ask for it first.
- Use model to specify a different model (as "provider/modelId", or fuzzy e.g. "haiku", "sonnet").
- Use thinking to control extended thinking level.
- Use inherit_context if the agent needs the parent conversation history.${isolationGuideline}${scheduleGuideline}

## Writing the prompt

Brief the agent like a smart colleague who just walked into the room — it hasn't seen this conversation, doesn't know what you've tried, doesn't understand why this task matters.
- Explain what you're trying to accomplish and why.
- Describe what you've already learned or ruled out.
- Give enough context about the surrounding problem that the agent can make judgment calls rather than just following a narrow instruction.
- If you need a short response, say so ("report in under 200 words").
- Lookups: hand over the exact command. Investigations: hand over the question — prescribed steps become dead weight when the premise is wrong.

Terse command-style prompts produce shallow, generic work.

**Never delegate understanding.** Don't write "based on your findings, fix the bug" or "based on the research, implement it." Those phrases push synthesis onto the agent instead of doing it yourself. Write prompts that prove you understood: include file paths, line numbers, what specifically to change.`;
  const renderToolDescriptionTemplate = (template2) => {
    const vars = {
      typeList: buildTypeListText,
      compactTypeList: buildCompactTypeListText,
      agentDir: getAgentDir9,
      isolationGuideline: () => isolationGuideline,
      scheduleGuideline: () => scheduleGuideline
    };
    return template2.replace(/\{\{(\w+)\}\}/g, (raw, name) => {
      if (vars[name])
        return vars[name]();
      console.warn(`[pi-subagents] agent-tool-description.md: unknown placeholder ${raw} left as-is`);
      return raw;
    });
  };
  const loadCustomToolDescription = () => {
    for (const path of [
      join12(process.cwd(), ".pi", "agent-tool-description.md"),
      join12(getAgentDir9(), "agent-tool-description.md")
    ]) {
      try {
        if (!existsSync11(path))
          continue;
        const text = readFileSync9(path, "utf-8").trim();
        if (text)
          return renderToolDescriptionTemplate(text);
        console.warn(`[pi-subagents] ${path} is empty — ignoring`);
      } catch (err) {
        console.warn(`[pi-subagents] failed to read ${path}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return;
  };
  const agentToolDescription = (() => {
    const mode = getToolDescriptionMode();
    if (mode === "compact")
      return compactAgentToolDescription;
    if (mode === "custom") {
      const custom = loadCustomToolDescription();
      if (custom)
        return custom;
      console.warn('[pi-subagents] toolDescriptionMode is "custom" but no agent-tool-description.md found — using "full"');
    }
    return fullAgentToolDescription;
  })();
  const agentTool = defineTool3({
    name: SUBAGENT_TOOL_NAMES.AGENT,
    label: "Agent",
    description: agentToolDescription,
    promptSnippet: "Launch autonomous sub-agents for complex multi-step tasks",
    promptGuidelines: [
      "Use Agent with specialized agents when the task matches an agent type's description. Subagents are valuable for parallelizing independent queries or for protecting the main context window from excessive results, but should not be used excessively when not needed. Importantly, avoid duplicating work that subagents are already doing — if you delegate research to a subagent, do not also perform the same searches yourself.",
      "For broad codebase exploration or research, spawn Agent with an appropriate subagent_type (e.g. Explore). Otherwise use direct tools (read, grep, find) when the target is already known.",
      "When an agent runs in the background, you will be notified on completion — do not poll or sleep waiting for it. Continue with other work instead.",
      "Trust but verify: an agent's summary describes intent, not outcome. When an agent writes or edits code, check the actual changes before reporting work as done."
    ],
    parameters: Type.Object({
      prompt: Type.String({
        description: "The task for the agent to perform."
      }),
      description: Type.String({
        description: "A short (3-5 word) description of the task (shown in UI)."
      }),
      name: Type.Optional(Type.String({
        description: 'Optional memorable name for this agent, e.g. "auth-audit", so it can be addressed as `@name` at the prompt and by steer_subagent / get_subagent_result. Letters, digits, `_` and `-`. Worth setting when several agents of the same type run at once; omit for one-off work. The agent stays reachable by its type either way.'
      })),
      subagent_type: Type.String({
        description: `The type of specialized agent to use. Available types: ${getAvailableTypes().join(", ")}. Custom agents from .pi/agents/*.md (project) or ${getAgentDir9()}/agents/*.md (global) are also available.`
      }),
      model: Type.Optional(Type.String({
        description: `Optional model override. Accepts "provider/modelId" or fuzzy name (e.g. "haiku", "sonnet"). Omit to use the agent type's default.`
      })),
      thinking: Type.Optional(Type.String({
        description: `Thinking level: ${THINKING_LEVELS.join(", ")}. Overrides agent default.`
      })),
      max_turns: Type.Optional(Type.Number({
        description: "Maximum number of agentic turns before stopping. Omit for unlimited (default).",
        minimum: 1
      })),
      run_in_background: Type.Optional(Type.Boolean({
        description: "Defaults to true — the agent runs detached, returning its ID immediately, and you are notified on completion. Set false only when your very next action depends on the result; the call then blocks and returns the agent's full output inline."
      })),
      resume: Type.Optional(Type.String({
        description: "Optional agent ID to resume from. Continues from previous context. Resumes detached like any other spawn; pass run_in_background: false to block and get the result inline. An agent can only be resumed once its current run has finished — use steer_subagent to reach one mid-run."
      })),
      isolated: Type.Optional(Type.Boolean({
        description: "If true, agent gets no extension/MCP tools — only built-in tools."
      })),
      inherit_context: Type.Optional(Type.Boolean({
        description: "If true, fork parent conversation into the agent. Default: false (fresh context)."
      })),
      ...isolationParam(isWorktreeIsolationEnabled()),
      ...scheduleParam
    }),
    renderCall(args, theme, context) {
      const rowBackground = hasAgentBadge(args.subagent_type) ? theme.getBgAnsi(context.isPartial ? "toolPendingBg" : context.isError ? "toolErrorBg" : "toolSuccessBg") : "";
      const desc = args.description ?? "";
      const name = renderAgentName(args.subagent_type, theme, {
        fallbackColor: "toolTitle",
        restoreBackground: rowBackground,
        bold: true
      });
      return new Text2(rowBackground + "▸ " + name + (desc ? "  " + theme.fg("muted", desc) : ""), 0, 0);
    },
    renderResult(result, { expanded, isPartial }, theme, renderContext) {
      const details = result.details;
      const text = result.content[0]?.type === "text" ? result.content[0].text : "";
      if (renderContext.isError || !details?.status) {
        return new Text2(text, 0, 0);
      }
      const stats2 = (d) => {
        const parts = [];
        if (d.modelName)
          parts.push(d.modelName);
        if (d.tags)
          parts.push(...d.tags);
        if (d.turnCount != null && d.turnCount > 0) {
          parts.push(formatTurns(d.turnCount, d.maxTurns));
        }
        if (d.toolUses > 0)
          parts.push(`${d.toolUses} tool use${d.toolUses === 1 ? "" : "s"}`);
        if (d.tokens)
          parts.push(d.tokens);
        if (showCost) {
          const costText = formatCost(d.cost ?? 0);
          if (costText)
            parts.push(costText);
        }
        return parts.map((p2) => fgPreservingNestedStyles(theme, "dim", p2)).join(" " + theme.fg("dim", "·") + " ");
      };
      if (isPartial || details.status === "running") {
        const frame = SPINNER[details.spinnerFrame ?? 0];
        const s3 = stats2(details);
        return renderRunningAgentStatus(frame, s3, details.activity ?? "thinking…", theme);
      }
      if (details.status === "background") {
        return new Text2(theme.fg("dim", `  ⎿  Running in background (ID: ${details.agentId})`), 0, 0);
      }
      if (details.status === "completed" || details.status === "steered") {
        const duration = formatMs(details.durationMs);
        const isSteered = details.status === "steered";
        const icon = isSteered ? theme.fg("warning", "✓") : theme.fg("success", "✓");
        const s3 = stats2(details);
        let line2 = icon + (s3 ? " " + s3 : "");
        line2 += " " + theme.fg("dim", "·") + " " + theme.fg("dim", duration);
        if (expanded) {
          const resultText = result.content[0]?.type === "text" ? result.content[0].text : "";
          if (resultText) {
            const lines = resultText.split(`
`).slice(0, 50);
            for (const l of lines) {
              line2 += `
` + theme.fg("dim", `  ${l}`);
            }
            if (resultText.split(`
`).length > 50) {
              line2 += `
` + theme.fg("muted", "  ... (use get_subagent_result with verbose for full output)");
            }
          }
        } else {
          const doneText = isSteered ? "Wrapped up (turn limit)" : "Done";
          line2 += `
` + theme.fg("dim", `  ⎿  ${doneText}`);
        }
        return new Text2(line2, 0, 0);
      }
      if (details.status === "stopped") {
        const s3 = stats2(details);
        let line2 = theme.fg("dim", "■") + (s3 ? " " + s3 : "");
        line2 += `
` + theme.fg("dim", "  ⎿  Stopped");
        return new Text2(line2, 0, 0);
      }
      if (details.status !== "error" && details.status !== "aborted") {
        return new Text2(text, 0, 0);
      }
      const s2 = stats2(details);
      let line = theme.fg("error", "✗") + (s2 ? " " + s2 : "");
      if (details.status === "error") {
        line += `
` + theme.fg("error", `  ⎿  Error: ${details.error ?? "unknown"}`);
      } else {
        line += `
` + theme.fg("warning", "  ⎿  Aborted (max turns exceeded)");
      }
      return new Text2(line, 0, 0);
    },
    execute: async (toolCallId, params, signal, onUpdate, ctx) => {
      widget.setUICtx(ctx.ui);
      reloadCustomAgents();
      const rawType = params.subagent_type;
      const dispatch = resolveSpawnType(rawType);
      if (!dispatch.ok && !params.resume)
        return textResult2(dispatch.message);
      const subagentType = dispatch.ok ? dispatch.type : rawType;
      const requestedType = dispatch.ok && dispatch.fellBackFrom || subagentType;
      const fallbackNote = dispatch.ok && dispatch.fellBackFrom !== undefined ? `Note: Unknown agent type "${dispatch.fellBackFrom}" — using ${resolveType(subagentType) ? subagentType : "the fallback agent config"}.

` : "";
      const displayName = getDisplayName(subagentType);
      const customConfig = getAgentConfig(subagentType);
      const resolvedConfig = resolveAgentInvocationConfig(customConfig, params, {
        worktreeAllowed: isWorktreeIsolationEnabled(),
        defaultRunInBackground: getBackgroundByDefault()
      });
      let model = ctx.model;
      if (resolvedConfig.modelInput) {
        const resolved = resolveModel(resolvedConfig.modelInput, ctx.modelRegistry);
        if (typeof resolved === "string") {
          if (resolvedConfig.modelFromParams)
            return textResult2(resolved);
        } else {
          model = resolved;
        }
      }
      const scopeVerdict = checkModelScope({
        model,
        cwd: ctx.cwd,
        modelRegistry: ctx.modelRegistry,
        callerSupplied: resolvedConfig.modelFromParams,
        agentLabel: customConfig?.displayName ?? subagentType,
        modelInput: resolvedConfig.modelInput
      });
      if (scopeVerdict.kind === "error")
        return textResult2(scopeVerdict.message);
      if (scopeVerdict.kind === "warn")
        ctx.ui.notify(scopeVerdict.message, "warning");
      const thinking = resolvedConfig.thinking;
      const inheritContext = resolvedConfig.inheritContext;
      const runInBackground = resolvedConfig.runInBackground;
      const isolated = resolvedConfig.isolated;
      const isolation = resolvedConfig.isolation;
      const outputTranscript = customConfig?.outputTranscript ?? getOutputTranscriptDefault();
      const attachTranscript = (rec, agentId) => {
        if (!rec || !outputTranscript)
          return;
        rec.outputFile = createOutputFilePath(ctx.cwd, agentId, ctx.sessionManager.getSessionId());
        writeInitialEntry(rec.outputFile, agentId, params.prompt, ctx.cwd);
      };
      const { modelName, modelId } = model ? describeModel(model) : { modelName: undefined, modelId: undefined };
      const askedModel = ((asked) => {
        if (!asked)
          return;
        const resolvedAsked = resolveModel(asked, ctx.modelRegistry);
        if (typeof resolvedAsked === "string")
          return asked;
        return resolvedAsked.provider === model?.provider && resolvedAsked.id === model?.id ? undefined : asked;
      })(resolvedConfig.overridden?.model);
      const effectiveMaxTurns = normalizeMaxTurns(resolvedConfig.maxTurns ?? getDefaultMaxTurns());
      const agentInvocation = {
        modelName,
        modelId,
        thinking,
        requestedThinking: resolvedConfig.overridden?.thinking,
        requestedModel: askedModel,
        maxTurns: normalizeMaxTurns(resolvedConfig.maxTurns),
        isolated,
        inheritContext,
        runInBackground,
        isolation
      };
      const modeLabel = getPromptModeLabel(subagentType);
      const { tags: invocationTags } = buildInvocationTags(agentInvocation);
      const agentTags = modeLabel ? [modeLabel, ...invocationTags] : invocationTags;
      const detailBase = {
        displayName,
        description: params.description,
        subagentType,
        modelName,
        tags: agentTags.length > 0 ? agentTags : undefined
      };
      const detailBaseFor = (rec) => {
        if (!rec?.invocation)
          return detailBase;
        const type6 = rec.type;
        const { modelName: recModelName, tags } = buildInvocationTags(rec.invocation);
        const recModeLabel = getPromptModeLabel(type6);
        const recTags = recModeLabel ? [recModeLabel, ...tags] : tags;
        return {
          displayName: getDisplayName(type6),
          description: rec.description,
          subagentType: type6,
          modelName: recModelName,
          tags: recTags.length > 0 ? recTags : undefined
        };
      };
      if (params.schedule) {
        if (!isSchedulingEnabled()) {
          return textResult2("Scheduling is disabled in this project. Enable via /agents → Settings → Scheduling.");
        }
        if (params.resume) {
          return textResult2("Cannot combine `schedule` with `resume` — schedules create fresh agents.");
        }
        if (params.inherit_context) {
          return textResult2("Cannot combine `schedule` with `inherit_context` — there is no parent conversation at fire time.");
        }
        if (params.run_in_background === false) {
          return textResult2("Cannot combine `schedule` with `run_in_background: false` — scheduled jobs always run in background.");
        }
        if (!scheduler.isActive()) {
          return textResult2("Scheduler is not active in this session yet. Try again after the session has fully started.");
        }
        try {
          const job = scheduler.addJob({
            name: params.description,
            description: params.description,
            schedule: params.schedule,
            subagent_type: requestedType,
            prompt: params.prompt,
            model: params.model,
            thinking,
            max_turns: effectiveMaxTurns,
            isolated,
            isolation
          });
          const next = scheduler.getNextRun(job.id);
          return textResult2(`${fallbackNote}Scheduled "${job.name}" (id: ${job.id}, type: ${job.scheduleType}). ` + `Next run: ${next ?? "(unknown)"}. ` + `Manage via /agents → Scheduled jobs.`);
        } catch (err) {
          return textResult2(err instanceof Error ? err.message : String(err));
        }
      }
      if (params.resume) {
        const existing = manager.getRecord(params.resume);
        if (!existing || !isTopLevelAgent(existing)) {
          return textResult2(`Agent not found: "${params.resume}". It may have been cleaned up.`);
        }
        if (!existing.session) {
          return textResult2(`Agent "${params.resume}" has no active session to resume.`);
        }
        if (runInBackground) {
          const id2 = existing.id;
          if (existing.status === "running" || existing.status === "queued") {
            return textResult2(`Agent "${params.resume}" is still ${existing.status} — it can only be resumed once its current run finishes.
` + `Use steer_subagent to send it a message mid-run, or get_subagent_result to wait for it.`);
          }
          const record7 = await startBackgroundResume(ctx, existing, params.prompt, {
            outputTranscript,
            maxTurns: effectiveMaxTurns,
            toolCallId
          });
          if (!record7) {
            return textResult2(`Failed to resume agent "${params.resume}".`);
          }
          const isQueued = record7.status === "queued";
          return textResult2(`Agent ${isQueued ? "queued" : "resumed"} in background.
` + `Agent ID: ${id2}
` + `Type: ${existing.type}
` + (record7.outputFile ? `Output file: ${record7.outputFile}
` : "") + (isQueued ? `Position: queued (max ${manager.getMaxConcurrent()} concurrent)
` : "") + `
You will be notified when this agent completes.
` + `Use get_subagent_result to retrieve full results, or steer_subagent to send it messages.`, { ...detailBaseFor(record7), toolUses: record7.toolUses, tokens: "", durationMs: 0, status: "background", agentId: id2 });
        }
        const record6 = await manager.resume(params.resume, params.prompt, signal);
        if (!record6) {
          return textResult2(`Failed to resume agent "${params.resume}".`);
        }
        if (record6.status === "error") {
          return textResult2(`Agent failed: ${record6.error}${partialOutputSuffix(record6)}`, buildDetails(detailBaseFor(record6), record6));
        }
        return textResult2(record6.result?.trim() || "No output.", buildDetails(detailBaseFor(record6), record6));
      }
      if (runInBackground) {
        const { state: bgState, callbacks: bgCallbacks } = createActivityTracker(effectiveMaxTurns);
        let id2;
        const origBgOnSession = bgCallbacks.onSessionCreated;
        bgCallbacks.onSessionCreated = (session) => {
          origBgOnSession(session);
          const rec = manager.getRecord(id2);
          if (rec?.outputFile) {
            rec.outputCleanup = streamToOutputFile(session, rec.outputFile, id2, ctx.cwd);
          }
        };
        id2 = manager.spawn(pi, ctx, subagentType, params.prompt, {
          description: params.description,
          name: params.name,
          model,
          maxTurns: effectiveMaxTurns,
          isolated,
          inheritContext,
          thinkingLevel: thinking,
          isBackground: true,
          isolation,
          invocation: agentInvocation,
          rootSessionId: ctx.sessionManager.getSessionId(),
          ...bgCallbacks
        });
        const joinMode = resolveJoinMode(defaultJoinMode, true);
        const record6 = manager.getRecord(id2);
        if (record6 && joinMode) {
          record6.joinMode = joinMode;
          record6.toolCallId = toolCallId;
          attachTranscript(record6, id2);
        }
        await manager.awaitStartup(id2);
        if (joinMode == null || joinMode === "async") {} else {
          currentBatchAgents.push({ id: id2, joinMode });
          if (batchFinalizeTimer)
            clearTimeout(batchFinalizeTimer);
          batchFinalizeTimer = setTimeout(finalizeBatch, 100);
        }
        agentActivity.set(id2, bgState);
        widget.ensureTimer();
        widget.update();
        fleet.ensureTimer();
        fleet.update();
        pi.events.emit("subagents:created", {
          id: id2,
          type: subagentType,
          description: params.description,
          isBackground: true
        });
        const isQueued = record6?.status === "queued";
        return textResult2(`${fallbackNote}Agent ${isQueued ? "queued" : "started"} in background.
` + `Agent ID: ${id2}
` + `Type: ${displayName}
` + `Description: ${params.description}
` + (record6?.outputFile ? `Output file: ${record6.outputFile}
` : "") + (isQueued ? `Position: queued (max ${manager.getMaxConcurrent()} concurrent)
` : "") + `
You will be notified when this agent completes.
` + `Use get_subagent_result to retrieve full results, or steer_subagent to send it messages.
` + `Do not duplicate this agent's work.`, { ...detailBaseFor(record6), toolUses: 0, tokens: "", durationMs: 0, status: "background", agentId: id2 });
      }
      let spinnerFrame = 0;
      const startedAt = Date.now();
      let fgId;
      let queuedAhead;
      const streamUpdate = () => {
        const fgRecord = fgId ? manager.getRecord(fgId) : undefined;
        const details2 = {
          ...detailBaseFor(fgRecord),
          toolUses: fgState.toolUses,
          tokens: fgRecord ? formatLifetimeTokens(fgRecord) : "",
          cost: fgRecord ? getLifetimeCost(fgRecord.lifetimeUsage) : 0,
          turnCount: fgState.turnCount,
          maxTurns: fgState.maxTurns,
          durationMs: Date.now() - startedAt,
          status: "running",
          activity: queuedAhead === undefined ? describeActivity(fgState.activeTools, fgState.responseText) : `queued — waiting for a foreground slot${queuedAhead > 0 ? ` (${queuedAhead} ahead)` : ""}`,
          spinnerFrame: spinnerFrame % SPINNER.length
        };
        onUpdate?.({
          content: [{ type: "text", text: `${fgState.toolUses} tool uses...` }],
          details: details2
        });
      };
      const { state: fgState, callbacks: fgCallbacks } = createActivityTracker(effectiveMaxTurns, streamUpdate);
      const origOnSession = fgCallbacks.onSessionCreated;
      fgCallbacks.onSessionCreated = (session) => {
        origOnSession(session);
        if (queuedAhead !== undefined) {
          queuedAhead = undefined;
          streamUpdate();
        }
        for (const a of manager.listAgents()) {
          if (a.session === session) {
            fgId = a.id;
            agentActivity.set(a.id, fgState);
            widget.ensureTimer();
            fleet.ensureTimer();
            fleet.update();
            break;
          }
        }
        if (fgId) {
          const rec = manager.getRecord(fgId);
          if (rec?.outputFile) {
            rec.outputCleanup = streamToOutputFile(session, rec.outputFile, fgId, ctx.cwd);
          }
        }
      };
      const spinnerInterval = setInterval(() => {
        spinnerFrame++;
        streamUpdate();
      }, 80);
      streamUpdate();
      let record5;
      try {
        const fgResult = await manager.spawnAndWait(pi, ctx, subagentType, params.prompt, {
          description: params.description,
          name: params.name,
          model,
          maxTurns: effectiveMaxTurns,
          isolated,
          inheritContext,
          thinkingLevel: thinking,
          isolation,
          invocation: agentInvocation,
          signal,
          rootSessionId: ctx.sessionManager.getSessionId(),
          onQueued: (_id, ahead) => {
            queuedAhead = ahead;
            streamUpdate();
          },
          ...fgCallbacks
        }, (fgAgentId) => {
          const fgRec = manager.getRecord(fgAgentId);
          attachTranscript(fgRec, fgAgentId);
        });
        record5 = fgResult.record;
      } finally {
        clearInterval(spinnerInterval);
        if (fgId) {
          agentActivity.delete(fgId);
          widget.markFinished(fgId);
          fleet.onAgentFinished(fgId);
        }
      }
      const tokenText = formatLifetimeTokens(record5);
      const details = buildDetails(detailBaseFor(record5), record5, fgState, { tokens: tokenText });
      if (record5.status === "error") {
        return textResult2(`${fallbackNote}Agent failed: ${record5.error}${partialOutputSuffix(record5)}`, details);
      }
      const durationMs = (record5.completedAt ?? Date.now()) - record5.startedAt;
      const statsParts = [`${record5.toolUses} tool uses`];
      if (tokenText)
        statsParts.push(tokenText);
      if (showCost) {
        const costText = formatCost(getLifetimeCost(record5.lifetimeUsage));
        if (costText)
          statsParts.push(costText);
      }
      return textResult2(`${fallbackNote}Agent completed in ${formatMs(durationMs)} (${statsParts.join(", ")})${getForegroundOutcomeNote(record5.status)}.

` + (record5.result?.trim() || "No output."), details);
    }
  });
  function withUsageReporting(tool) {
    return {
      ...tool,
      execute: async (toolCallId, ...rest5) => {
        const result = await tool.execute(toolCallId, ...rest5);
        if (!reportUsage || !toolCallId)
          return result;
        const usage = pendingUsage.drain();
        return usage ? { ...result, usage } : result;
      }
    };
  }
  function registerToolReportingUsage(tool) {
    pi.registerTool(withUsageReporting(tool));
  }
  const registeredAgentTool = withUsageReporting(agentTool);
  pi.registerTool(registeredAgentTool);
  const workflowTasks = new Map;
  function fleetWorkflows() {
    return [...workflowTasks.values()].map((task) => ({
      id: task.id,
      name: task.meta?.name ?? task.workflowName ?? task.id,
      status: task.status,
      doneCount: task.doneCount,
      totalCount: task.agentCount,
      startedAt: task.startTime,
      ...task.endTime !== undefined ? { completedAt: task.endTime } : {},
      tokens: task.totalTokens
    }));
  }
  async function runWorkflowTask(ctx, task) {
    try {
      const result = await runWorkflow({
        script: task.script,
        args: task.args,
        signal: task.abortController.signal,
        host: createWorkflowHost({
          pi,
          ctx,
          manager,
          signal: task.abortController.signal,
          rootSessionId: ctx.sessionManager.getSessionId(),
          workflowId: task.id
        }),
        onProgress: (entries) => updateWorkflowProgressBatch(task, entries),
        onControl: (control) => {
          task.control = control;
        },
        journal: {
          ...task.replay !== undefined ? { entries: task.replay } : {},
          ...task.journalPath !== undefined ? { append: (entry) => appendJournal(task.journalPath, entry) } : {}
        }
      });
      completeWorkflowTask(task, result);
    } catch (err) {
      failWorkflowTask(task, err instanceof Error ? err.message : String(err));
    }
  }
  function notifyWorkflowFinished(task) {
    widget.update();
    fleet.update();
    const result = workflowResultText(task);
    scheduleNudge(task.id, () => {
      pi.sendMessage({
        customType: "subagent-notification",
        content: formatWorkflowNotification(task),
        display: true,
        details: {
          id: task.id,
          description: `Workflow ${task.workflowName ?? task.id}`,
          status: task.status === "completed" ? "completed" : task.status === "killed" ? "stopped" : "error",
          toolUses: task.totalToolCalls,
          turnCount: 0,
          totalTokens: task.totalTokens,
          durationMs: elapsedMs(task, Date.now()),
          error: task.error,
          resultPreview: result.length > 500 ? `${result.slice(0, 500)}…` : result
        }
      }, { deliverAs: "followUp", triggerTurn: true });
    });
  }
  const workflowTool = defineTool3({
    name: SUBAGENT_TOOL_NAMES.WORKFLOW,
    label: "SubagentWorkflow",
    description: renderToolDescriptionTemplate(fullWorkflowToolDescription),
    promptSnippet: "Run a deterministic script that orchestrates many subagents",
    promptGuidelines: [
      "Use SubagentWorkflow when the number of agents depends on something discovered at runtime, when work flows through stages, or when findings should be independently verified. Use Agent for one delegated task or a handful you can name up front.",
      "Prefer `pipeline` over `parallel` — a barrier costs wall-clock whenever the stages are unevenly sized.",
      "A workflow runs in the background and notifies you when it finishes — do not poll or sleep waiting for it."
    ],
    parameters: Type.Object({
      script: Type.Optional(Type.String({
        maxLength: 524288,
        description: "Inline workflow source. Must begin with `export const meta = { name, description }`."
      })),
      scriptPath: Type.Optional(Type.String({
        description: "Path to a workflow script file, absolute or relative to the project. Takes precedence over `script` — this is how you re-run an edited workflow."
      })),
      name: Type.Optional(Type.String({
        description: "Name of a saved workflow — `<name>.js` in .pi/workflows/, .agents/workflows/ or the user's agent dir. Lowest precedence: `scriptPath` and `script` both win over it."
      })),
      args: Type.Optional(Type.Any({
        description: "Exposed to the script as the global `args`, verbatim. Must be JSON-shaped."
      })),
      resumeFromRunId: Type.Optional(Type.String({
        pattern: "^wf_[a-z0-9-]{6,}$",
        description: "Run id of an earlier workflow in this session. Its unchanged leading agent() calls return their recorded results instantly; the first changed or failed call, and everything after it, runs live. Same script and args means nothing re-runs."
      })),
      title: Type.Optional(Type.String({ description: "Ignored — set the workflow title in the script's `meta` block." })),
      description: Type.Optional(Type.String({ description: "Ignored — set the workflow description in the script's `meta` block." }))
    }),
    renderCall(args, theme) {
      return new Text2(`${theme.fg("toolTitle", "▸ ")}${theme.bold(theme.fg("toolTitle", "SubagentWorkflow"))}  ${theme.fg("muted", workflowCallName(args))}`, 0, 0);
    },
    renderResult(result, _options, theme, renderContext) {
      const text = result.content[0]?.type === "text" ? result.content[0].text : "";
      const taskId = result.details?.taskId;
      const task = taskId !== undefined ? workflowTasks.get(taskId) : undefined;
      if (renderContext.isError || !task)
        return new Text2(text, 0, 0);
      return renderWorkflowCard({
        progress: task.workflowProgress,
        task: {
          status: task.status,
          workflowName: task.workflowName,
          startTime: task.startTime,
          endTime: task.endTime,
          totalPausedMs: task.totalPausedMs
        },
        meta: task.meta,
        agentCount: task.agentCount,
        totalTokens: task.totalTokens
      }, theme);
    },
    execute: async (toolCallId, params, _signal, _onUpdate, ctx) => {
      const resumeFrom = resolveResumeTarget(params.resumeFromRunId, workflowTasks);
      if (resumeFrom !== undefined && !resumeFrom.ok)
        return textResult2(resumeFrom.message);
      const resolved = resolveWorkflowScript(params.script === undefined && params.scriptPath === undefined && params.name === undefined && resumeFrom !== undefined ? { scriptPath: resumeFrom.scriptPath } : params, ctx.cwd);
      if (!resolved.ok)
        return textResult2(resolved.message);
      let meta;
      try {
        meta = extractMeta(resolved.script).meta;
      } catch (err) {
        return textResult2(err instanceof Error ? err.message : String(err));
      }
      const runId = workflowRunId();
      let savedPath;
      let journalPath;
      try {
        const dir = sessionTaskDir(ctx.cwd, ctx.sessionManager.getSessionId());
        savedPath = join12(dir, `${runId}.workflow.js`);
        writeFileSync4(savedPath, resolved.script, "utf-8");
        journalPath = join12(dir, `${runId}.workflow.jsonl`);
      } catch (err) {
        savedPath = undefined;
        journalPath = undefined;
        console.warn(`[pi-subagents] could not persist workflow script: ${err instanceof Error ? err.message : String(err)}`);
      }
      const replay = resumeFrom !== undefined ? readJournal(resumeFrom.journalPath) : undefined;
      const task = createWorkflowTask({
        id: runId,
        script: resolved.script,
        scriptPath: resolved.scriptPath ?? savedPath,
        args: params.args,
        meta,
        toolCallId,
        ...journalPath !== undefined ? { journalPath } : {},
        ...replay !== undefined && replay.length > 0 ? { replay, resumedFrom: resumeFrom.runId } : {}
      });
      workflowTasks.set(runId, task);
      widget.update();
      fleet.update();
      runWorkflowTask(ctx, task).then(() => notifyWorkflowFinished(task));
      return {
        content: [{
          type: "text",
          text: `Workflow "${meta.name}" started in the background.
` + `Task ID: ${runId}
` + (task.scriptPath ? `Script: ${task.scriptPath}
` : "") + (task.resumedFrom !== undefined ? `Resuming ${task.resumedFrom}: ${task.replay?.length ?? 0} recorded call(s) available to replay.
` : params.resumeFromRunId !== undefined ? `Nothing to replay from ${params.resumeFromRunId} — every agent runs live.
` : "") + `
You will be notified when it finishes — do NOT poll or sleep waiting for it.
` + `To iterate, edit the script file and call SubagentWorkflow again with scriptPath.`
        }],
        details: { taskId: runId }
      };
    }
  });
  if (isWorkflowsEnabled())
    pi.registerTool(workflowTool);
  let collisionsChecked = false;
  function resolveWorkflowCollisions(ctx) {
    if (collisionsChecked)
      return;
    collisionsChecked = true;
    const warn = (message) => {
      if (ctx.hasUI)
        ctx.ui.notify(message, "warning");
      else
        console.warn(`[pi-subagents] ${message}`);
    };
    try {
      if (!isWorkflowsEnabled())
        return;
      const verdict = decideWorkflowCollision({
        tools: pi.getAllTools(),
        ownDescription: workflowTool.description,
        pinned: isWorkflowsPinned()
      });
      if (verdict.kind === "none")
        return;
      if (verdict.kind === "report") {
        warn(verdict.message);
        return;
      }
      workflowsEnabled = false;
      widget.update();
      fleet.update();
      warn(verdict.message);
      if (!verdict.withdraw)
        return;
      const active = pi.getActiveTools();
      if (active.includes(SUBAGENT_TOOL_NAMES.WORKFLOW)) {
        pi.setActiveTools(active.filter((name) => name !== SUBAGENT_TOOL_NAMES.WORKFLOW));
      }
    } catch {}
  }
  let workflowFlagHandled = false;
  function runWorkflowFlag(ctx) {
    if (workflowFlagHandled)
      return;
    const flag = pi.getFlag(WORKFLOW_FILE_FLAG);
    if (flag === undefined || flag === false)
      return;
    workflowFlagHandled = true;
    const report = (message, level) => {
      if (ctx.hasUI)
        ctx.ui.notify(message, level);
      else
        console.warn(`[pi-subagents] ${message}`);
    };
    if (!isWorkflowsEnabled()) {
      report(`--${WORKFLOW_FILE_FLAG} ignored: workflows are off. Turn them on in /agents → Settings → Workflows, ` + 'or set `"workflowsEnabled": true` in .pi/subagents.json.', "warning");
      return;
    }
    if (typeof flag !== "string" || flag.trim() === "") {
      report(`--${WORKFLOW_FILE_FLAG} needs a path: --${WORKFLOW_FILE_FLAG}=<path>`, "warning");
      return;
    }
    const path = isAbsolute4(flag.trim()) ? flag.trim() : join12(ctx.cwd, flag.trim());
    let script3;
    try {
      script3 = readFileSync9(path, "utf-8");
    } catch (err) {
      report(`Could not read ${path}: ${err instanceof Error ? err.message : String(err)}`, "warning");
      return;
    }
    let meta;
    try {
      meta = extractMeta(script3).meta;
    } catch (err) {
      report(err instanceof Error ? err.message : String(err), "warning");
      return;
    }
    const task = createWorkflowTask({ id: workflowRunId(), script: script3, scriptPath: path, meta });
    workflowTasks.set(task.id, task);
    widget.update();
    fleet.update();
    report(`Running workflow ${meta.name}…`, "info");
    runWorkflowTask(ctx, task).then(() => {
      pi.appendEntry(WORKFLOW_ENTRY_TYPE, workflowEntryData(task));
      pi.sendMessage({
        customType: "workflow-result",
        content: formatWorkflowNotification(task),
        display: false
      }, { deliverAs: "nextTurn" });
      widget.update();
      fleet.update();
    });
  }
  registerToolReportingUsage(defineTool3({
    name: SUBAGENT_TOOL_NAMES.GET_RESULT,
    label: "Get Agent Result",
    description: "Check status and retrieve a background agent's full result — its completion notification carries only a preview. Use the agent ID returned by Agent.",
    promptSnippet: "Check status and retrieve results from a background agent",
    parameters: Type.Object({
      agent_id: Type.String({
        description: "The agent ID to check. The agent's handle also works — its `name` if you gave it one, otherwise its type (`explore`, `explore-2`)."
      }),
      wait: Type.Optional(Type.Boolean({
        description: "If true, wait for the agent to complete before returning. Default: false."
      })),
      verbose: Type.Optional(Type.Boolean({
        description: "If true, include the agent's full conversation (messages + tool calls). Default: false."
      }))
    }),
    execute: async (_toolCallId, params, signal, _onUpdate, _ctx) => {
      const record5 = resolveAgentRef(params.agent_id);
      if (!record5 || !isTopLevelAgent(record5)) {
        return textResult2(`Agent not found: "${params.agent_id}". It may have been cleaned up.`);
      }
      if (params.wait && (record5.status === "running" || record5.status === "queued")) {
        while (record5.status === "queued") {
          await abortable(new Promise((resolve3) => setTimeout(resolve3, QUEUE_WAIT_POLL_MS)), signal);
        }
        if (record5.promise)
          await abortable(record5.promise, signal);
      }
      const displayName = getDisplayName(record5.type);
      const duration = formatDuration(record5.startedAt, record5.completedAt);
      const tokens = formatLifetimeTokens(record5);
      const contextPercent = getSessionContextPercent(record5.session);
      const statsParts = [`Tool uses: ${record5.toolUses}`];
      if (tokens)
        statsParts.push(tokens);
      if (showCost) {
        const costText = formatCost(getLifetimeCost(record5.lifetimeUsage));
        if (costText)
          statsParts.push(`Cost: ${costText}`);
      }
      if (contextPercent !== null)
        statsParts.push(`Context: ${Math.round(contextPercent)}%`);
      if (record5.compactionCount)
        statsParts.push(`Compactions: ${record5.compactionCount}`);
      statsParts.push(`Duration: ${duration}`);
      let output = `Agent: ${record5.id}
` + `Type: ${displayName} | Status: ${record5.status}${getStatusNote(record5.status)} | ${statsParts.join(" | ")}
` + `Description: ${record5.description}

`;
      if (record5.status === "running") {
        output += "Agent is still running. Use wait: true or check back later.";
      } else if (record5.status === "error") {
        output += `Error: ${record5.error}${partialOutputSuffix(record5)}`;
      } else {
        output += record5.result?.trim() || "No output.";
      }
      if (record5.status !== "running" && record5.status !== "queued") {
        record5.resultConsumed = true;
        cancelNudge(params.agent_id);
      }
      if (params.verbose && record5.session) {
        const conversation = getAgentConversation(record5.session);
        if (conversation) {
          output += `

--- Agent Conversation ---
${conversation}`;
        }
      }
      return textResult2(output);
    }
  }));
  registerToolReportingUsage(defineTool3({
    name: SUBAGENT_TOOL_NAMES.STEER,
    label: "Steer Agent",
    description: "Send a steering message to a running agent. The message will interrupt the agent after its current tool execution " + "and be injected into its conversation, allowing you to redirect its work mid-run. Only works on running agents.",
    promptSnippet: "Send a steering message to redirect a running background agent",
    parameters: Type.Object({
      agent_id: Type.String({
        description: "The agent ID to steer (must be currently running). The agent's handle also works — its `name` if you gave it one, otherwise its type (`explore`, `explore-2`)."
      }),
      message: Type.String({
        description: "The steering message to send. This will appear as a user message in the agent's conversation."
      })
    }),
    execute: async (_toolCallId, params, _signal, _onUpdate, _ctx) => {
      const record5 = resolveAgentRef(params.agent_id);
      if (!record5 || !isTopLevelAgent(record5)) {
        return textResult2(`Agent not found: "${params.agent_id}". It may have been cleaned up.`);
      }
      if (record5.status !== "running") {
        return textResult2(`Agent "${params.agent_id}" is not running (status: ${record5.status}). Cannot steer a non-running agent.`);
      }
      if (!record5.session) {
        if (!record5.pendingSteers)
          record5.pendingSteers = [];
        record5.pendingSteers.push(params.message);
        pi.events.emit("subagents:steered", { id: record5.id, message: params.message });
        return textResult2(`Steering message queued for agent ${record5.id}. It will be delivered once the session initializes.`);
      }
      try {
        await steerAgent(record5.session, params.message);
        pi.events.emit("subagents:steered", { id: record5.id, message: params.message });
        const tokens = formatLifetimeTokens(record5);
        const contextPercent = getSessionContextPercent(record5.session);
        const stateParts = [];
        if (tokens)
          stateParts.push(tokens);
        if (showCost) {
          const costText = formatCost(getLifetimeCost(record5.lifetimeUsage));
          if (costText)
            stateParts.push(costText);
        }
        stateParts.push(`${record5.toolUses} tool ${record5.toolUses === 1 ? "use" : "uses"}`);
        if (contextPercent !== null)
          stateParts.push(`context ${Math.round(contextPercent)}% full`);
        if (record5.compactionCount)
          stateParts.push(`${record5.compactionCount} compaction${record5.compactionCount === 1 ? "" : "s"}`);
        return textResult2(`Steering message sent to agent ${record5.id}. The agent will process it after its current tool execution.
` + `Current state: ${stateParts.join(" · ")}`);
      } catch (err) {
        return textResult2(`Failed to steer agent: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }));
  function getModelLabel(type6, registry2) {
    const cfg = getAgentConfig(type6);
    if (!cfg?.model)
      return "inherit";
    const label = getModelLabelFromConfig(cfg.model);
    if (!registry2)
      return label;
    const resolved = resolveModel(cfg.model, registry2);
    if (typeof resolved === "string")
      return `${label} (unavailable, fallback: inherit)`;
    const resolvedFull = `${resolved.provider}/${resolved.id}`;
    const norm = (s2) => s2.toLowerCase().replace(/\./g, "-").replace(/-\d{8}$/, "");
    if (norm(cfg.model) === norm(resolvedFull))
      return label;
    return `${label} (→ ${resolvedFull.replace(/-\d{8}$/, "")})`;
  }
  async function showAgentsMenu(ctx) {
    reloadCustomAgents();
    const allNames = getAllTypes();
    const options = [];
    const agents2 = manager.listAgents().filter(isTopLevelAgent);
    if (agents2.length > 0) {
      const running = agents2.filter((a) => a.status === "running" || a.status === "queued").length;
      const done = agents2.filter((a) => a.status === "completed" || a.status === "steered").length;
      options.push(`Running agents (${agents2.length}) — ${running} running, ${done} done`);
    }
    if (allNames.length > 0) {
      options.push(`Agent types (${allNames.length})`);
    }
    if (scheduler.isActive()) {
      const jobCount = scheduler.list().length;
      options.push(`Scheduled jobs (${jobCount})`);
    }
    if (isWorkflowsEnabled()) {
      options.push(`Workflows (${workflowTasks.size})`);
    }
    options.push("Create new agent");
    options.push("Settings");
    const noAgentsMsg = allNames.length === 0 && agents2.length === 0 ? `No agents found. Create specialized subagents that can be delegated to.

` + `Each subagent has its own context window, custom system prompt, and specific tools.

` + `Try creating: Code Reviewer, Security Auditor, Test Writer, or Documentation Writer.

` : "";
    if (noAgentsMsg) {
      ctx.ui.notify(noAgentsMsg, "info");
    }
    const choice = await ctx.ui.select("Agents", options);
    if (!choice)
      return;
    if (choice.startsWith("Running agents (")) {
      await showRunningAgents(ctx);
      await showAgentsMenu(ctx);
    } else if (choice.startsWith("Agent types (")) {
      await showAllAgentsList(ctx);
      await showAgentsMenu(ctx);
    } else if (choice.startsWith("Scheduled jobs (")) {
      await showSchedulesMenu(ctx, scheduler);
      await showAgentsMenu(ctx);
    } else if (choice.startsWith("Workflows (")) {
      await showWorkflowsMenu(ctx, workflowMenuDeps);
      await showAgentsMenu(ctx);
    } else if (choice === "Create new agent") {
      await showCreateWizard(ctx);
    } else if (choice === "Settings") {
      await showSettings(ctx);
      await showAgentsMenu(ctx);
    }
  }
  async function showAllAgentsList(ctx) {
    const allNames = getAllTypes();
    if (allNames.length === 0) {
      ctx.ui.notify("No agents.", "info");
      return;
    }
    const sourceIndicator = (cfg) => {
      const disabled = cfg?.enabled === false;
      if (cfg?.source === "project")
        return disabled ? "✕• " : "•  ";
      if (cfg?.source === "global")
        return disabled ? "✕◦ " : "◦  ";
      if (disabled)
        return "✕  ";
      return "   ";
    };
    const items3 = allNames.map((name) => {
      const cfg = getAgentConfig(name);
      const disabled = cfg?.enabled === false;
      const model = getModelLabel(name, ctx.modelRegistry);
      return {
        id: name,
        label: `${sourceIndicator(cfg)}${name}`,
        currentValue: model,
        description: disabled ? "(disabled)" : cfg?.description ?? name,
        values: [model]
      };
    });
    const hasCustom = allNames.some((n) => {
      const c = getAgentConfig(n);
      return c && !c.isDefault && c.enabled !== false;
    });
    const hasDisabled = allNames.some((n) => getAgentConfig(n)?.enabled === false);
    const legendParts = [];
    if (hasCustom)
      legendParts.push("• = project  ◦ = global");
    if (hasDisabled)
      legendParts.push("✕ = disabled");
    const selected = await ctx.ui.custom((_tui, _theme, _kb, done) => {
      const slTheme = getSettingsListTheme();
      const list = new SettingsList(items3, Math.min(items3.length, 12), slTheme, (id2) => done(id2), () => done(undefined));
      const container = new Container;
      container.addChild(new Text2("Agent types", 0, 0));
      if (legendParts.length)
        container.addChild(new Text2(slTheme.hint(legendParts.join("  ")), 0, 0));
      container.addChild(new Spacer(1));
      container.addChild(list);
      return {
        render: (w2) => container.render(w2),
        invalidate: () => container.invalidate(),
        handleInput: (data) => list.handleInput?.(data)
      };
    });
    if (selected && getAgentConfig(selected)) {
      await showAgentDetail(ctx, selected);
      await showAllAgentsList(ctx);
    }
  }
  async function showRunningAgents(ctx) {
    const agents2 = manager.listAgents().filter(isTopLevelAgent);
    if (agents2.length === 0) {
      ctx.ui.notify("No agents.", "info");
      return;
    }
    const record5 = await selectItem(ctx.ui, "Running agents", agents2, (a) => {
      const dn = getDisplayName(a.type);
      const dur = formatDuration(a.startedAt, a.completedAt);
      return `${dn} (${a.description}) · ${a.toolUses} tools · ${a.status} · ${dur}`;
    });
    if (!record5)
      return;
    await viewAgentConversation(ctx, record5);
    await showRunningAgents(ctx);
  }
  async function viewAgentConversation(ctx, record5) {
    if (!record5.session) {
      ctx.ui.notify(`Agent is ${record5.status === "queued" ? "queued" : "expired"} — no session available.`, "info");
      return;
    }
    const { ConversationViewer: ConversationViewer2, VIEWPORT_HEIGHT_PCT: VIEWPORT_HEIGHT_PCT2 } = await Promise.resolve().then(() => (init_conversation_viewer(), exports_conversation_viewer));
    const session = record5.session;
    const activity = agentActivity.get(record5.id);
    await ctx.ui.custom((tui, theme, keybindings, done) => {
      return new ConversationViewer2(tui, session, record5, activity, theme, done, () => {
        if (manager.abort(record5.id)) {
          ctx.ui.notify(`Stopped "${record5.description}".`, "info");
        }
      }, keybindings, (message) => manager.steer(record5.id, message), showCost, getViewerMarkdown, (mode) => chooseViewerMarkdown(mode, ctx));
    }, {
      overlay: true,
      overlayOptions: { anchor: "center", width: "90%", maxHeight: `${VIEWPORT_HEIGHT_PCT2}%` }
    });
  }
  async function showAgentDetail(ctx, name) {
    const cfg = getAgentConfig(name);
    if (!cfg) {
      ctx.ui.notify(`Agent config not found for "${name}".`, "warning");
      return;
    }
    const file = locateAgentFile(name, cfg.sourcePath);
    const isDefault = cfg.isDefault === true;
    const disabled = cfg.enabled === false;
    let menuOptions;
    if (disabled && file) {
      menuOptions = isDefault ? ["Enable", "Edit", "Reset to default", "Delete", "Back"] : ["Enable", "Edit", "Delete", "Back"];
    } else if (isDefault && !file) {
      menuOptions = ["Eject (export as .md)", "Disable", "Back"];
    } else if (isDefault && file) {
      menuOptions = ["Edit", "Disable", "Reset to default", "Delete", "Back"];
    } else {
      menuOptions = ["Edit", "Disable", "Delete", "Back"];
    }
    const choice = await ctx.ui.select(name, menuOptions);
    if (!choice || choice === "Back")
      return;
    if (choice === "Edit" && file) {
      const content = readFileSync9(file.path, "utf-8");
      const edited = await ctx.ui.editor(`Edit ${name}`, content);
      if (edited !== undefined && edited !== content) {
        const { writeFileSync: writeFileSync5 } = await import("node:fs");
        writeFileSync5(file.path, edited, "utf-8");
        reloadCustomAgents();
        ctx.ui.notify(`Updated ${file.path}`, "info");
      }
    } else if (choice === "Delete") {
      if (file) {
        const confirmed = await ctx.ui.confirm("Delete agent", `Delete ${name} from ${file.location} (${file.path})?`);
        if (confirmed) {
          unlinkSync2(file.path);
          reloadCustomAgents();
          ctx.ui.notify(`Deleted ${file.path}`, "info");
        }
      }
    } else if (choice === "Reset to default" && file) {
      const confirmed = await ctx.ui.confirm("Reset to default", `Delete override ${file.path} and restore embedded default?`);
      if (confirmed) {
        unlinkSync2(file.path);
        reloadCustomAgents();
        ctx.ui.notify(`Restored default ${name}`, "info");
      }
    } else if (choice.startsWith("Eject")) {
      await ejectAgent(ctx, name, cfg);
    } else if (choice === "Disable") {
      await disableAgent(ctx, name);
    } else if (choice === "Enable") {
      await enableAgent(ctx, name);
    }
  }
  async function ejectAgent(ctx, name, cfg) {
    const location = await ctx.ui.select("Choose location", [
      "Project (.pi/agents/)",
      `Personal (${personalAgentsDir()})`
    ]);
    if (!location)
      return;
    const targetDir = location.startsWith("Project") ? projectAgentsDir() : personalAgentsDir();
    mkdirSync5(targetDir, { recursive: true });
    const targetPath = join12(targetDir, `${name}.md`);
    if (existsSync11(targetPath)) {
      const overwrite = await ctx.ui.confirm("Overwrite", `${targetPath} already exists. Overwrite?`);
      if (!overwrite)
        return;
    }
    const content = serializeAgentFile(cfg);
    const { writeFileSync: writeFileSync5 } = await import("node:fs");
    writeFileSync5(targetPath, content, "utf-8");
    reloadCustomAgents();
    ctx.ui.notify(`Ejected ${name} to ${targetPath}`, "info");
  }
  async function disableAgent(ctx, name) {
    const file = locateAgentFile(name, getAgentConfig(name)?.sourcePath);
    if (file) {
      const content = readFileSync9(file.path, "utf-8");
      const { content: updated, outcome } = disableInContent(content);
      if (outcome === "already-disabled") {
        ctx.ui.notify(`${name} is already disabled.`, "info");
        return;
      }
      if (outcome === "no-frontmatter") {
        ctx.ui.notify(`Cannot disable ${name}: ${file.path} has no frontmatter block.`, "error");
        return;
      }
      const { writeFileSync: writeFileSync6 } = await import("node:fs");
      writeFileSync6(file.path, updated, "utf-8");
      reloadCustomAgents();
      ctx.ui.notify(`Disabled ${name} (${file.path})`, "info");
      return;
    }
    const location = await ctx.ui.select("Choose location", [
      "Project (.pi/agents/)",
      `Personal (${personalAgentsDir()})`
    ]);
    if (!location)
      return;
    const targetDir = location.startsWith("Project") ? projectAgentsDir() : personalAgentsDir();
    mkdirSync5(targetDir, { recursive: true });
    const targetPath = join12(targetDir, `${name}.md`);
    const { writeFileSync: writeFileSync5 } = await import("node:fs");
    writeFileSync5(targetPath, `---
enabled: false
---
`, "utf-8");
    reloadCustomAgents();
    ctx.ui.notify(`Disabled ${name} (${targetPath})`, "info");
  }
  async function enableAgent(ctx, name) {
    const file = locateAgentFile(name, getAgentConfig(name)?.sourcePath);
    if (!file)
      return;
    const content = readFileSync9(file.path, "utf-8");
    const { content: updated, changed } = enableInContent(content);
    if (!changed && !isEmptyStub(updated)) {
      ctx.ui.notify(`${name} is not disabled in ${file.path}.`, "info");
      return;
    }
    const { writeFileSync: writeFileSync5 } = await import("node:fs");
    if (isEmptyStub(updated)) {
      unlinkSync2(file.path);
      reloadCustomAgents();
      ctx.ui.notify(`Enabled ${name} (removed ${file.path})`, "info");
    } else {
      writeFileSync5(file.path, updated, "utf-8");
      reloadCustomAgents();
      ctx.ui.notify(`Enabled ${name} (${file.path})`, "info");
    }
  }
  async function showCreateWizard(ctx) {
    const location = await ctx.ui.select("Choose location", [
      "Project (.pi/agents/)",
      `Personal (${personalAgentsDir()})`
    ]);
    if (!location)
      return;
    const targetDir = location.startsWith("Project") ? projectAgentsDir() : personalAgentsDir();
    const method = await ctx.ui.select("Creation method", [
      "Generate with Claude (recommended)",
      "Manual configuration"
    ]);
    if (!method)
      return;
    if (method.startsWith("Generate")) {
      await showGenerateWizard(ctx, targetDir);
    } else {
      await showManualWizard(ctx, targetDir);
    }
  }
  async function showGenerateWizard(ctx, targetDir) {
    const description = await ctx.ui.input("Describe what this agent should do");
    if (!description)
      return;
    const name = await ctx.ui.input("Agent name (filename, no spaces)");
    if (!name)
      return;
    mkdirSync5(targetDir, { recursive: true });
    const targetPath = join12(targetDir, `${name}.md`);
    if (existsSync11(targetPath)) {
      const overwrite = await ctx.ui.confirm("Overwrite", `${targetPath} already exists. Overwrite?`);
      if (!overwrite)
        return;
    }
    ctx.ui.notify("Generating agent definition...", "info");
    const generatePrompt = `Create a custom pi sub-agent definition file based on this description: "${description}"

Write a markdown file to: ${targetPath}

The file format is a markdown file with YAML frontmatter and a system prompt body:

\`\`\`markdown
---
description: <one-line description shown in UI>
color: <optional agent name badge color: red, blue, green, yellow, purple, orange, pink, cyan, an Agency Agents alias, or quoted "#RRGGBB">
tools: <comma-separated built-in tools: read, bash, edit, write, grep, find, ls. Use "none" for no tools. Omit for all tools>
model: <optional model as "provider/modelId", e.g. "anthropic/claude-haiku-4-5". Omit to inherit parent model>
thinking: <optional thinking level: ${THINKING_LEVELS.join(", ")}. Omit to inherit>
max_turns: <optional max agentic turns. 0 or omit for unlimited (default)>
prompt_mode: <"replace" (body IS the full system prompt) or "append" (body is appended to default prompt). Default: replace>
extensions: <true (inherit all MCP/extension tools), false (none), or comma-separated names. Default: true>
skills: <true (inherit all), false (none), or comma-separated skill names to preload into prompt. Default: true>
disallowed_tools: <comma-separated tool names to block, even if otherwise available. Omit for none>
inherit_context: <true to fork parent conversation into agent so it sees chat history. Default: false>
run_in_background: <pin this agent to background (true) or foreground (false). Omit to follow the backgroundByDefault setting, which is background>
output_transcript: <false to write no transcript file or path for this agent. Independent of persist_session. Default: true>
isolated: <true for no extension/MCP tools, only built-in tools. Default: false>
memory: <"user" (global), "project" (per-project), or "local" (gitignored per-project) for persistent memory. Omit for none>${isWorktreeIsolationEnabled() ? `
isolation: <"worktree" to run in isolated git worktree; "off" to refuse one even when the caller asks. Omit for normal>` : ""}
---

<system prompt body — instructions for the agent>
\`\`\`

Guidelines for choosing settings:
- For read-only tasks (review, analysis): tools: read, bash, grep, find, ls
- For code modification tasks: include edit, write
- Use prompt_mode: append if the agent should keep the default system prompt and add specialization on top
- Use prompt_mode: replace for fully custom agents with their own personality/instructions
- Set inherit_context: true if the agent needs to know what was discussed in the parent conversation
- Set isolated: true if the agent should NOT have access to MCP servers or other extensions
- Set output_transcript: false to skip writing this agent's transcript; this alone doesn't keep the run off disk (persist_session, isolation: worktree commits, and memory still write) — set those too if that's the goal
- Only include frontmatter fields that differ from defaults — omit fields where the default is fine

Write the file using the write tool. Only write the file, nothing else.`;
    const { record: record5 } = await manager.spawnAndWait(pi, ctx, "general-purpose", generatePrompt, {
      description: `Generate ${name} agent`,
      maxTurns: 5,
      bypassQueue: true
    });
    if (record5.status === "error") {
      ctx.ui.notify(`Generation failed: ${record5.error}`, "warning");
      return;
    }
    reloadCustomAgents();
    if (existsSync11(targetPath)) {
      ctx.ui.notify(`Created ${targetPath}`, "info");
    } else {
      ctx.ui.notify("Agent generation completed but file was not created. Check the agent output.", "warning");
    }
  }
  async function showManualWizard(ctx, targetDir) {
    const name = await ctx.ui.input("Agent name (filename, no spaces)");
    if (!name)
      return;
    const description = await ctx.ui.input("Description (one line)");
    if (!description)
      return;
    const toolChoice = await ctx.ui.select("Tools", ["all", "none", "read-only (read, bash, grep, find, ls)", "custom..."]);
    if (!toolChoice)
      return;
    let tools;
    if (toolChoice === "all") {
      tools = BUILTIN_TOOL_NAMES.join(", ");
    } else if (toolChoice === "none") {
      tools = "none";
    } else if (toolChoice.startsWith("read-only")) {
      tools = "read, bash, grep, find, ls";
    } else {
      const customTools = await ctx.ui.input("Tools (comma-separated)", BUILTIN_TOOL_NAMES.join(", "));
      if (!customTools)
        return;
      tools = customTools;
    }
    const modelChoice = await ctx.ui.select("Model", [
      "inherit (parent model)",
      "haiku",
      "sonnet",
      "opus",
      "custom..."
    ]);
    if (!modelChoice)
      return;
    let model;
    if (modelChoice === "haiku")
      model = "anthropic/claude-haiku-4-5";
    else if (modelChoice === "sonnet")
      model = "anthropic/claude-sonnet-4-6";
    else if (modelChoice === "opus")
      model = "anthropic/claude-opus-4-6";
    else if (modelChoice === "custom...") {
      model = await ctx.ui.input("Model (provider/modelId)") || undefined;
    }
    const thinkingChoice = await ctx.ui.select("Thinking level", ["inherit", ...THINKING_LEVELS]);
    if (!thinkingChoice)
      return;
    const systemPrompt = await ctx.ui.editor("System prompt", "");
    if (systemPrompt === undefined)
      return;
    const content = buildNewAgentFile({
      description,
      tools,
      model,
      thinking: thinkingChoice === "inherit" ? undefined : thinkingChoice,
      systemPrompt
    });
    mkdirSync5(targetDir, { recursive: true });
    const targetPath = join12(targetDir, `${name}.md`);
    if (existsSync11(targetPath)) {
      const overwrite = await ctx.ui.confirm("Overwrite", `${targetPath} already exists. Overwrite?`);
      if (!overwrite)
        return;
    }
    const { writeFileSync: writeFileSync5 } = await import("node:fs");
    writeFileSync5(targetPath, content, "utf-8");
    reloadCustomAgents();
    ctx.ui.notify(`Created ${targetPath}`, "info");
  }
  function snapshotSettings() {
    return {
      agentOverrides: configuredAgentOverrides,
      maxConcurrent: manager.getMaxConcurrent(),
      maxConcurrentForeground: manager.getMaxConcurrentForeground(),
      defaultMaxTurns: getDefaultMaxTurns() ?? 0,
      graceTurns: getGraceTurns(),
      defaultJoinMode: getDefaultJoinMode(),
      backgroundByDefault: getBackgroundByDefault(),
      schedulingEnabled: isSchedulingEnabled(),
      scopeModels: isScopeModelsEnabled(),
      strictAgentFiles,
      disableDefaultAgents: isDefaultsDisabled(),
      toolDescriptionMode: getToolDescriptionMode(),
      fleetView: isFleetViewEnabled(),
      agentMentions: getAgentMentionMode(),
      rememberAgents: getRememberAgents(),
      widgetMode: getWidgetMode(),
      outputTranscript: getOutputTranscriptDefault(),
      worktreeIsolation: isWorktreeIsolationEnabled(),
      workflowsEnabled: isWorkflowsPinned() ? isWorkflowsEnabled() : undefined,
      maxSubagentDepth: getMaxSubagentDepth(),
      fallbackSubagent: getFallbackSubagent(),
      reportUsage: isReportUsageEnabled(),
      showCost: isShowCostEnabled(),
      showModel: isShowModelEnabled(),
      viewerMarkdown: getViewerMarkdown()
    };
  }
  const _settingsSnapshotIsComplete = true;
  const NUMERIC_IDS = new Set([
    "maxConcurrent",
    "maxConcurrentForeground",
    "defaultMaxTurns",
    "graceTurns",
    "maxSubagentDepth"
  ]);
  async function showSettings(ctx) {
    function buildItems() {
      const mc = manager.getMaxConcurrent();
      const mcf = manager.getMaxConcurrentForeground();
      const dmt = getDefaultMaxTurns() ?? 0;
      const gt = getGraceTurns();
      const msd = getMaxSubagentDepth();
      const fallbackValue = getFallbackSubagent() ?? "general-purpose";
      const fallbackValues = [...new Set([...getAvailableTypes(), NO_FALLBACK])];
      return [
        {
          id: "maxConcurrent",
          label: "Max concurrency",
          description: "Max concurrent background agents (Enter to type)",
          currentValue: String(mc),
          values: [String(mc)]
        },
        {
          id: "maxConcurrentForeground",
          label: "Max foreground concurrency",
          description: "Max concurrent foreground (blocking) agents (0 = unlimited, Enter to type)",
          currentValue: String(mcf),
          values: [String(mcf)]
        },
        {
          id: "defaultMaxTurns",
          label: "Default max turns",
          description: "Default max turns before wrap-up (0 = unlimited, Enter to type)",
          currentValue: String(dmt),
          values: [String(dmt)]
        },
        {
          id: "graceTurns",
          label: "Grace turns",
          description: "Grace turns after wrap-up steer (Enter to type)",
          currentValue: String(gt),
          values: [String(gt)]
        },
        {
          id: "maxSubagentDepth",
          label: "Nested depth",
          description: "Hard cap on nested delegation — main is 0, its subagents 1 (0/1 = nesting off, Enter to type)",
          currentValue: String(msd),
          values: [String(msd)]
        },
        {
          id: "joinMode",
          label: "Join mode",
          description: "Default join mode for background agents",
          currentValue: getDefaultJoinMode(),
          values: ["smart", "async", "group"]
        },
        {
          id: "backgroundByDefault",
          label: "Background by default",
          description: "An Agent call that doesn't say runs detached (off = blocks the turn and returns inline)",
          currentValue: getBackgroundByDefault() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "schedulingEnabled",
          label: "Scheduling",
          description: "Schedule subagent feature (off removes `schedule` param from Agent tool spec on next pi session)",
          currentValue: isSchedulingEnabled() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "workflowsEnabled",
          label: "Workflows",
          description: "Scripted workflows, on unless another extension provides a workflow tool (off keeps the SubagentWorkflow tool out of the tool spec; applies on next pi session)",
          currentValue: isWorkflowsEnabled() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "scopeModels",
          label: "Scope models",
          description: "Validate subagent models against scoped models (/scoped-models)",
          currentValue: isScopeModelsEnabled() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "strictAgentFiles",
          label: "Strict agent files",
          description: "Fail startup on an unreadable/unparseable agent .md instead of skipping it with a warning",
          currentValue: strictAgentFiles ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "disableDefaultAgents",
          label: "Disable defaults",
          description: "Hide built-in agents (general-purpose, Explore, Plan) — custom agents are unaffected",
          currentValue: isDefaultsDisabled() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "fallbackSubagent",
          label: "Fallback agent",
          description: `Agent used when subagent_type is unknown, disabled, or ambiguous; "${NO_FALLBACK}" rejects the call instead (strict dispatch)`,
          currentValue: fallbackValue,
          values: fallbackValues
        },
        {
          id: "outputTranscript",
          label: "Output transcript",
          description: "Write each subagent's .output transcript by default. A custom agent's output_transcript frontmatter overrides this.",
          currentValue: getOutputTranscriptDefault() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "worktreeIsolation",
          label: "Worktree isolation",
          description: "Allow isolation: worktree to copy the repo. Off refuses worktrees on every path immediately — for repos where a copy costs too much time or disk — and drops the `isolation` param from the Agent tool spec on next pi session.",
          currentValue: isWorktreeIsolationEnabled() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "reportUsage",
          label: "Report usage to session",
          description: "Add subagent tokens and cost to this session's own totals, so pi's footer and /cost stop reading a delegating session as nearly free. Reported on the next tool result (agents that finish in the background are counted on the one after). Context-window % is unaffected.",
          currentValue: isReportUsageEnabled() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "showCost",
          label: "Show cost",
          description: "Show an estimated `~$0.0042` beside subagent token counts in the widget, fleet view, results and notifications. Priced by pi from the model's rates — omitted entirely for a model it has no rates for.",
          currentValue: isShowCostEnabled() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "showModel",
          label: "Show model",
          description: "Name the model driving each agent, and the thinking level it is running at, on the widget's running rows. The Agent tool result and the conversation viewer show the pair either way — this adds it to the widget, where the row is already dense.",
          currentValue: isShowModelEnabled() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "viewerMarkdown",
          label: "Viewer markdown",
          description: "How much of the conversation viewer renders as Markdown. assistant = assistant text only (default); all = tool results too, for tools that emit Markdown — accepting that a Markdown pass over a diff or a log eats `#` comments, swallows a `---` line and re-fences indented output; off = everything verbatim. `m` in the viewer cycles the same setting (footer: raw / md / md+).",
          currentValue: getViewerMarkdown(),
          values: ["off", "assistant", "all"]
        },
        {
          id: "fleetView",
          label: "Fleet view",
          description: "Claude Code-style main+subagents list below the editor (↓/← to navigate, Enter to view)",
          currentValue: isFleetViewEnabled() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "agentMentions",
          label: "Agent mentions",
          description: "Route `@handle message` at the prompt to that agent. model = an off-screen clone of this conversation calls the Agent tool, so the agent gets a context-written prompt, a transcript and per-tool detail, and the chat stays clean; direct = started here from your text, no model call. Messaging and resuming are direct either way.",
          currentValue: getAgentMentionMode(),
          values: ["model", "direct", "off"]
        },
        {
          id: "rememberAgents",
          label: "Remember agents",
          description: "Persist subagent sessions so `@handle` can resume one long after it finished (they also appear in /resume)",
          currentValue: getRememberAgents() ? "on" : "off",
          values: ["on", "off"]
        },
        {
          id: "widgetMode",
          label: "Widget",
          description: "Above-editor agent widget: all = every agent; background = hide foreground (they already render inline); off = hide the widget.",
          currentValue: getWidgetMode(),
          values: ["all", "background", "off"]
        },
        {
          id: "toolDescriptionMode",
          label: "Tool description",
          description: "Agent tool description sent to the LLM: full (rich, default), compact (~75% fewer tokens, for small/local models), or custom (.pi/agent-tool-description.md with {{placeholders}})",
          currentValue: getToolDescriptionMode(),
          values: ["full", "compact", "custom"]
        }
      ];
    }
    function applyValue(id2, value2) {
      if (id2 === "maxConcurrent") {
        const n = parseInt(value2, 10);
        if (n >= 1) {
          manager.setMaxConcurrent(n);
          notifyApplied(ctx, `Max concurrency set to ${n}`);
        }
      } else if (id2 === "maxConcurrentForeground") {
        const n = parseInt(value2, 10);
        if (n >= 0) {
          manager.setMaxConcurrentForeground(n);
          notifyApplied(ctx, n === 0 ? "Max foreground concurrency set to unlimited" : `Max foreground concurrency set to ${n}`);
        }
      } else if (id2 === "defaultMaxTurns") {
        const n = parseInt(value2, 10);
        if (n === 0) {
          setDefaultMaxTurns(undefined);
          notifyApplied(ctx, "Default max turns set to unlimited");
        } else if (n >= 1) {
          setDefaultMaxTurns(n);
          notifyApplied(ctx, `Default max turns set to ${n}`);
        }
      } else if (id2 === "graceTurns") {
        const n = parseInt(value2, 10);
        if (n >= 1) {
          setGraceTurns(n);
          notifyApplied(ctx, `Grace turns set to ${n}`);
        }
      } else if (id2 === "maxSubagentDepth") {
        const n = parseInt(value2, 10);
        if (n >= 0) {
          setMaxSubagentDepth(n);
          notifyApplied(ctx, n <= 1 ? "Nested delegation disabled" : `Nested depth set to ${n}. Applies to agents started from now on.`);
        }
      } else if (id2 === "joinMode") {
        setDefaultJoinMode(value2);
        notifyApplied(ctx, `Default join mode set to ${value2}`);
      } else if (id2 === "backgroundByDefault") {
        const enabled = value2 === "on";
        setBackgroundByDefault(enabled);
        notifyApplied(ctx, enabled ? "Agent calls run in the background unless they pass run_in_background: false" : "Agent calls block and return inline unless they pass run_in_background: true");
      } else if (id2 === "schedulingEnabled") {
        const enabled = value2 === "on";
        if (enabled === isSchedulingEnabled()) {
          ctx.ui.notify(`Scheduling already ${enabled ? "enabled" : "disabled"}.`, "info");
        } else {
          setSchedulingEnabled(enabled);
          if (!enabled)
            scheduler.stop();
          notifyApplied(ctx, `Scheduling ${enabled ? "enabled" : "disabled"}. Tool spec change takes effect on next pi session.`);
        }
      } else if (id2 === "workflowsEnabled") {
        const enabled = value2 === "on";
        if (enabled === isWorkflowsEnabled()) {
          ctx.ui.notify(`Workflows already ${enabled ? "enabled" : "disabled"}.`, "info");
        } else {
          setWorkflowsEnabled(enabled);
          notifyApplied(ctx, `Workflows ${enabled ? "enabled" : "disabled"}. Tool spec change takes effect on next pi session.`);
        }
      } else if (id2 === "scopeModels") {
        const enabled = value2 === "on";
        setScopeModelsEnabled(enabled);
        notifyApplied(ctx, `Scope models ${enabled ? "enabled" : "disabled"}`);
      } else if (id2 === "strictAgentFiles") {
        const enabled = value2 === "on";
        strictAgentFiles = enabled;
        notifyApplied(ctx, `Strict agent files ${enabled ? "enabled" : "disabled"}. Takes effect on next pi session.`);
      } else if (id2 === "disableDefaultAgents") {
        const enabled = value2 === "on";
        setDisableDefaultAgents(enabled);
        notifyApplied(ctx, `Default agents ${enabled ? "disabled" : "enabled"}. Tool spec change takes effect on next pi session.`);
      } else if (id2 === "fallbackSubagent") {
        setFallbackSubagent(value2);
        notifyApplied(ctx, value2 === NO_FALLBACK ? "Unknown or disabled agent types will now be rejected" : `Unknown agent types will fall back to ${value2}`);
      } else if (id2 === "outputTranscript") {
        const enabled = value2 === "on";
        setOutputTranscriptDefault(enabled);
        notifyApplied(ctx, `Output transcript ${enabled ? "enabled" : "disabled"} by default`);
      } else if (id2 === "worktreeIsolation") {
        const enabled = value2 === "on";
        setWorktreeIsolationEnabled(enabled);
        notifyApplied(ctx, `Worktree isolation ${enabled ? "enabled" : "disabled"}. Tool parameter updates on next pi session.`);
      } else if (id2 === "toolDescriptionMode") {
        setToolDescriptionMode(value2);
        notifyApplied(ctx, `Tool description set to ${value2}. Takes effect on next pi session.`);
      } else if (id2 === "reportUsage") {
        const enabled = value2 === "on";
        setReportUsage(enabled);
        notifyApplied(ctx, enabled ? "Subagent usage now counted in this session's totals" : "Subagent usage no longer counted in this session's totals");
      } else if (id2 === "showCost") {
        const enabled = value2 === "on";
        setShowCost(enabled);
        notifyApplied(ctx, `Cost display ${enabled ? "enabled" : "disabled"}`);
      } else if (id2 === "showModel") {
        const enabled = value2 === "on";
        setShowModel(enabled);
        notifyApplied(ctx, `Model display ${enabled ? "enabled" : "disabled"}`);
      } else if (id2 === "viewerMarkdown") {
        setViewerMarkdown(value2);
        notifyApplied(ctx, `Viewer markdown set to ${value2}`);
      } else if (id2 === "fleetView") {
        const enabled = value2 === "on";
        setFleetViewEnabled(enabled);
        notifyApplied(ctx, `Fleet view ${enabled ? "enabled" : "disabled"}`);
      } else if (id2 === "agentMentions") {
        const mode = value2;
        setAgentMentionMode(mode);
        notifyApplied(ctx, mode === "off" ? "Agent mentions disabled" : mode === "model" ? "Agent mentions on — a conversation clone starts a mentioned agent off-screen" : "Agent mentions on — a mentioned agent starts here, with no model call");
      } else if (id2 === "rememberAgents") {
        const enabled = value2 === "on";
        setRememberAgents(enabled);
        notifyApplied(ctx, `Remember agents ${enabled ? "enabled" : "disabled"}`);
      } else if (id2 === "widgetMode") {
        setWidgetMode(value2);
        notifyApplied(ctx, `Widget set to ${value2}`);
      }
    }
    let list;
    let currentIndex = 0;
    const result = await ctx.ui.custom((_tui, _theme, _kb, done) => {
      const items3 = buildItems();
      list = new SettingsList(items3, items3.length + 2, getSettingsListTheme(), (id2, newValue) => {
        applyValue(id2, newValue);
      }, () => done(undefined));
      const container = new Container;
      container.addChild(new Text2("⚙  Subagent Settings", 0, 0));
      container.addChild(new Spacer(1));
      container.addChild(list);
      return {
        render: (w2) => container.render(w2),
        invalidate: () => container.invalidate(),
        handleInput: (data) => {
          if (matchesKey5(data, "up")) {
            currentIndex = Math.max(0, currentIndex - 1);
          } else if (matchesKey5(data, "down")) {
            currentIndex = Math.min(items3.length - 1, currentIndex + 1);
          }
          if (matchesKey5(data, Key2.enter) && NUMERIC_IDS.has(items3[currentIndex].id)) {
            done(items3[currentIndex].id);
            return;
          }
          list.handleInput?.(data);
        }
      };
    });
    if (result && NUMERIC_IDS.has(result)) {
      const current = result === "maxConcurrent" ? String(manager.getMaxConcurrent()) : result === "maxConcurrentForeground" ? String(manager.getMaxConcurrentForeground()) : result === "defaultMaxTurns" ? String(getDefaultMaxTurns() ?? 0) : result === "maxSubagentDepth" ? String(getMaxSubagentDepth()) : String(getGraceTurns());
      const label = result === "maxConcurrent" ? "Max concurrency (1+)" : result === "maxConcurrentForeground" ? "Max foreground concurrency (0 = unlimited)" : result === "defaultMaxTurns" ? "Default max turns (0 = unlimited)" : result === "maxSubagentDepth" ? "Nested depth (0/1 = nesting off)" : "Grace turns (1+)";
      let input = await ctx.ui.input(label, current);
      while (input != null) {
        const trimmed = input.trim();
        const n = Number(trimmed);
        if (trimmed !== "" && Number.isInteger(n)) {
          applyValue(result, String(n));
          await showSettings(ctx);
          return;
        }
        input = await ctx.ui.input(label, trimmed);
      }
    }
  }
  function persistSettings(ctx, changeMsg) {
    const { message, level } = saveAndEmitChanged(snapshotSettings(), changeMsg, (event, payload) => pi.events.emit(event, payload));
    if (level === "warning")
      ctx?.ui.notify(message, level);
  }
  function notifyApplied(ctx, successMsg) {
    const { message, level } = saveAndEmitChanged(snapshotSettings(), successMsg, (event, payload) => pi.events.emit(event, payload));
    ctx.ui.notify(message, level);
  }
  pi.registerCommand("agents", {
    description: "Manage agents",
    handler: async (_args, ctx) => {
      await showAgentsMenu(ctx);
    }
  });
  const workflowMenuDeps = {
    tasks: workflowTasks,
    getRecord: (id2) => manager.getRecord(id2),
    viewAgentConversation,
    getCtx: () => currentCtx
  };
  fleet.setWorkflowSource(fleetWorkflows, (id2) => openWorkflowFromFleet(id2, workflowMenuDeps));
}
export {
  workflowEntryData,
  renderRunningAgentStatus,
  formatToolsSuffix,
  src_default as default,
  WORKFLOW_FILE_FLAG,
  WORKFLOW_ENTRY_TYPE,
  FOREIGN_WORKFLOW_TOOL_NAMES
};
