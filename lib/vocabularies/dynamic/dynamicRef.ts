import type {CodeKeywordDefinition} from "../../types"
import type KeywordCxt from "../../compile/context"
import {_, getProperty, Code, Name} from "../../compile/codegen"
import N from "../../compile/names"
import {callRef} from "../core/ref"

const def: CodeKeywordDefinition = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (cxt) => dynamicRef(cxt, cxt.schema),
}

export function dynamicRef(cxt: KeywordCxt, ref: string): void {
  const {gen, keyword, it} = cxt
  if (ref[0] !== "#") throw new Error(`"${keyword}" only supports hash fragment reference`)
  const anchor = ref.slice(1)
  if (it.allErrors) {
    _dynamicRef()
  } else {
    const valid = gen.let("valid", false)
    _dynamicRef(valid)
    cxt.ok(valid)
  }

  function _dynamicRef(valid?: Name): void {
    // if (it.dynamicAnchors[anchor]) {
    const v = gen.let("_v", _`${N.dynamicAnchors}${getProperty(anchor)}`)
    gen.if(v, _callRef(v, valid), _callRef(it.validateName, valid))
    // } else {
    // _callRef(it.validateName, valid)()
    // }
  }

  function _callRef(validate: Code, valid?: Name): () => void {
    return valid
      ? () =>
          gen.block(() => {
            callRef(cxt, validate)
            gen.let(valid, true)
          })
      : () => callRef(cxt, validate)
  }
}

export default def
