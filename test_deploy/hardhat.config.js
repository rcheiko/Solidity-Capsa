/**
* @type import('hardhat/config').HardhatUserConfig
*/

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-gas-reporter");

const { API_URL, OWNER, PRIVATE_FUND_WALLET_CAPSA, PRIVATE_FEE_WALLET_CAPSA, PRIVATE_FUND_WALLET_LDG, PRIVATE_FEE_WALLET_LDG, PRIVATE_KEY_FEE_ROLE, PRIVATE_KEY_TEST_WALLET } = process.env;

module.exports = {
   solidity: "0.8.4",
   settings: {
      optimizer: {
         enable:true,
         runs:200 
      }
   },
   paths: {
      artficats: './artifacts'
   },
   networks: {
      hardhat: {
         chaidId: 1337
      }
   } 
   // defaultNetwork: "polygon_mumbai",
   // networks: {
   //    hardhat: {},
   //    polygon_mumbai: {
   //       url: API_URL,
   //       accounts: [`0x${OWNER}`, `0x${PRIVATE_FUND_WALLET_CAPSA}`, `0x${PRIVATE_FEE_WALLET_CAPSA}`, `0x${PRIVATE_FUND_WALLET_LDG}`, `0x${PRIVATE_FEE_WALLET_LDG}`,`0x${PRIVATE_KEY_FEE_ROLE}`, `0x${PRIVATE_KEY_TEST_WALLET}` ]
   //    }
   // },

}
