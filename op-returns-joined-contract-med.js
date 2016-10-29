"use strict"

// to run this file:
//
//
// ./build && node lib/op-returns-joined-contract-med.js
//
//
// ----------------------------------------------
// opreturn-joiner-contract
//
// op-returns-joined-contract (better name) TODO: republish

const fs = require('fs')
const c = console

const DEBUG = true
// const DEBUG = false

const SHOW_OPRS = true
// const SHOW_OPRS = false

// blockchain marriage certificate

// let blockcypher_op_returns = require("./blockcypher-opreturn")
let blockcypher_op_returns = fs.readFileSync("./op_returns.json").toString()
blockcypher_op_returns = JSON.parse(blockcypher_op_returns)
blockcypher_op_returns = blockcypher_op_returns.op_returns

let opReturns = blockcypher_op_returns
c.log(opReturns)
c.log("----------------")

const cleanOpReturn = (opRet) => {
    return opRet && opRet.substring(3).replace(/&#34;/g, '\"')
}

opReturns = opReturns.map((opr) => {
    return {
      op_return: cleanOpReturn(opr),
      // tx_id:     opr.tx_id,
    }
}).map((opr) => {
    let opRet = opr.op_return
    try {
        opRet = JSON.parse(opRet)
    } catch(e) {
        if (DEBUG) c.log("Error parsing JSON:", opr)
        return { error: "JSONParsingError" }
    }
    // opRet.tx_id = opr.tx_id
    return opRet
}).filter((x) =>{
  return x
}).reverse()


c.log("------------")
if (SHOW_OPRS) c.log("OP_RETURNS:", opReturns, "---")


let contract = {
  txIds:     [],
  opReturns: [],
}


opReturns.forEach((op_r) => {
    // if (op_r.error != "JSONParsingError") {
    if (!op_r.error) {
        let key = Object.keys(op_r)[0]
        contract.opReturns.push({
          key: key,
          op_return: op_r
        })
        let txId = op_r.tx_id
        Object.assign(contract, op_r)
        contract.txIds.push(txId)
    }
})

delete contract.tx_id

// -----

// UNCOMMENT THESE console logs to see the output

// c.log("Contract:")
// c.log(contract)

let contractStr = contract
delete contractStr.txIds
delete contractStr.opReturns
c.log(JSON.stringify(contractStr))


module.exports = contract

// c.log("Reconstructed signature.")
