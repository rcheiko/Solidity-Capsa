# UNIT TESTING :
You can run and see the unit testing  
```npx hardhat test```


# DEPLOY THE CONTRACT IN MUMBAI TEST NET :
You need to go in `hardhat.config.js` and uncomment the comment part and comment network part that wasn't commented  
```npx hardhat run scripts/deploy.js --network polygon_mumbai```  
  
You need to create a .env in folder test_deploy.js with this options :  
```API_URL```  
```OWNER```  
```PRIVATE_FUND_WALLET_CAPSA```  
```PRIVATE_FEE_WALLET_CAPSA```  
```PRIVATE_FUND_WALLET_LDG```  
```PRIVATE_FEE_WALLET_LDG```  
```PRIVATE_KEY_FEE_ROLE```  
```PRIVATE_KEY_TEST_WALLET```  
  
When the contract is deployed in mumbai test net you need to follow this step :  
  
- MINTER_ROLE -> CAPSA_TOKEN -> CAPSA_SWAP  
- MINTER_ROLE -> LDG_TOKEN -> LDG_SWAP  
  
- For the fund Wallet Capsa -> Approve USD in the CAPSA_SWAP  
- For the fund Wallet LDG -> Approve Capsa in the LDG_SWAP  
  
- Approve USD to deposit on LDG_SWAP  
- Approve LDG_TOKEN to withdraw on LDG_SWAP  