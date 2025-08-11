export const CONTRACT_ABI = [
  {
    "type": "event",
    "name": "TransactionAdded",
    "inputs": [
      { "name": "owner", "type": "address", "indexed": true },
      { "name": "index", "type": "uint256", "indexed": false },
      { "name": "amount", "type": "uint256", "indexed": false },
      { "name": "date", "type": "uint64", "indexed": false },
      { "name": "description", "type": "string", "indexed": false }
    ]
  },
  {
    "type": "function", "stateMutability": "nonpayable",
    "name": "addTransaction",
    "inputs": [
      { "name": "amount", "type": "uint256" },
      { "name": "date", "type": "uint64" },
      { "name": "description", "type": "string" }
    ],
    "outputs": []
  },
  {
    "type": "function", "stateMutability": "view",
    "name": "countByUser",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "type": "uint256" }]
  },
  {
    "type": "function", "stateMutability": "view",
    "name": "getUserTransaction",
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "index", "type": "uint256" }
    ],
    "outputs": [
      { "name": "amount", "type": "uint256" },
      { "name": "date", "type": "uint64" },
      { "name": "description", "type": "string" },
      { "name": "owner", "type": "address" }
    ]
  }
] as const;
