const { ethers } = require("hardhat");

async function main() {
  const [owner, fundWalletCapsa, feeWalletCapsa, fundWalletLDG, feeWalletLDG, feeRoleLDG ] = await ethers.getSigners();

  console.log('------------------------')
  console.log('Deploying contracts with the account: ' + owner.address);
  console.log('fund wallet: ' + fundWalletCapsa.address);
  console.log('feeWallet: ' + feeWalletCapsa.address);
  console.log('fundWalletLDG: ' + fundWalletLDG.address);
  console.log('feeWalletLDG: ' + feeWalletLDG.address);
  console.log('feeRoleLDG: ' + feeRoleLDG.address);
  console.log('------------------------');

  // Deploy capsatoken
    const capsatoken = await ethers.getContractFactory('CAPSAToken');
    const _capsatoken = await capsatoken.deploy();
    console.log("capsa token: " + _capsatoken.address);

  // Deploy usd
    const usd = await ethers.getContractFactory('usd');
    const _usd = await usd.deploy();
    console.log("usd: " + _usd.address);

  // Deploy ldg token
  const ldg_token = await ethers.getContractFactory('LDG_Defi');
  const _ldg_token = await ldg_token.deploy();
  console.log("ldg token: " + _ldg_token.address); 

  // Deploy Capsa Swap
  const capsaSwap = await ethers.getContractFactory('CapsaSwap');
  const _capsaSwap = await capsaSwap.deploy
  (
    _usd.address,
    _capsatoken.address,
    fundWalletCapsa.address,
    feeWalletCapsa.address
  );
  console.log("capsa swap: " + _capsaSwap.address); 

  // Deploy Ledgity Contract
  const ldgSwap = await ethers.getContractFactory('ldgSwap');
  const _ldgSwap = await ldgSwap.deploy
  (
    _usd.address,
    _capsaSwap.address,
    _capsatoken.address,
    _ldg_token.address,
    fundWalletLDG.address,
    feeWalletLDG.address,
    feeRoleLDG.address
  );
  console.log("Ledgity Swap: " + _ldgSwap.address); 

}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})