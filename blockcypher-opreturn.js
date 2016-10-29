"use strict"

// to run this file:
//
//
// ./build && node lib/blockcypher-opreturn.js
//
//
// ----------------------------------------------



// get op-return values with blockcypher
//
// notes: fork https://runkit.com/makevoid/eternity-wall-json-opreturn

const http = require('axios')
const fs   = require('fs')
const c    = console

// const DEBUG = true // enables console.log - checks only 1 transaction (disables loop)
const DEBUG = false


const url_base = "api.blockcypher.com/v1/btc/main"

// specify your address
//
const address  = "12RXhCqxnXgJyfJLL2mvcqT3jCQ2o6rMAR"
// TODO: pass it (optional, source config is king!) as an external parameter

const endpoint_addr = `addrs/${address}`

const url_addr      = `https://${url_base}/${endpoint_addr}`;

(async function() {

  if (DEBUG) c.log(`URL: ${url_addr}`)
  const resp = await http.get(url_addr)

  if (DEBUG) c.log(resp.data)

  // API returns only the first message - TODO FIXME api
  let tx_hashes = resp.data.txrefs.map((tx) => {
      return tx.tx_hash
  })

  let txs = []

  tx_hashes = new Set(tx_hashes)
  tx_hashes = Array.from(tx_hashes)


  //// alt:
  // await Promise.all(tx_hashes.forEach((tx_hash) => {
  //
  let idx = 0
  for (let tx_hash of tx_hashes) {
      if (DEBUG) c.log(`TX: ${tx_hash}`)

      let endpoint_tx = `txs/${tx_hash}`
      let url_tx      = `https://${url_base}/${endpoint_tx}`

      if (DEBUG) c.log(`URL: ${url_tx}`)

      let resp_tx = await http.get(url_tx)
      txs.push(resp_tx.data)
      if (DEBUG && idx > 2) break
      idx++
  }

  let tx_outs = []

  txs.forEach((tx) => {
      if (DEBUG) c.log(`tx: ${JSON.stringify(tx)}`)
      let outputs = tx.outputs
      if (DEBUG) c.log(`outputs: ${JSON.stringify(tx.outputs)}`)
      // tx_outs.concat(outputs)
      outputs.forEach((output) => {
          tx_outs.push(output)
      })
  })

  op_returns = tx_outs.filter((output) => {
      return output.script_type == "null-data"
  }).map((output) => {
      if (DEBUG) c.log(`output: ${JSON.stringify(output)}`)
      return output.data_string
  })


  if (DEBUG) {
    c.log("OP_RETURNS:\n", op_returns)

    c.log(JSON.stringify(op_returns))
  }

  let fileContents = JSON.stringify({
    op_returns: op_returns
  })
  fs.writeFileSync("op_returns.json", fileContents)


  module.exports = op_returns

}());
