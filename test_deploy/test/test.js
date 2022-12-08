const { ethers } = require('hardhat');
const { expect } = require('chai');

describe("contract ledgity unit testing", function() {

    before(async function() {
        [this.owner, this.fundWalletCapsa, this.feeWalletCapsa, this.fundWalletLDG, this.feeWalletLDG, this.feeRoleLDG, this.testWallet] = await ethers.getSigners();
        this.decimals = 10 ** 6;
    });

    it('Should deploy the smart contract', async function() {
        console.log('###################');
        console.log('owner wallet :', this.owner.address);
        console.log('fund capsa wallet :', this.fundWalletCapsa.address);
        console.log('fee capsa wallet :', this.feeWalletCapsa.address);
        console.log('fund ledgity wallet :', this.fundWalletLDG.address);
        console.log('fee ledgity wallet :', this.feeWalletLDG.address);
        console.log('fee role ledgity wallet :', this.feeRoleLDG.address);
        console.log('test wallet :', this.testWallet.address);
        console.log('###################\n');

        this.capsa_token = await hre.ethers.getContractFactory("CAPSAToken");
        this.capsa_token_deployed = await this.capsa_token.deploy();
        console.log("capsa token: " + this.capsa_token_deployed.address);
        const minter_role_capsa = await this.capsa_token_deployed.MINTER_ROLE();
        console.log('minter role :', minter_role_capsa);

        this.usd = await hre.ethers.getContractFactory("usd"); 
        this.usd_deployed = await this.usd.deploy();
        console.log("usd token: " + this.usd_deployed.address);

        this.ledgity_token = await hre.ethers.getContractFactory("LDG01");
        this.ledgity_token_deployed = await this.ledgity_token.deploy();
        console.log("ledgity token: " + this.ledgity_token_deployed.address);
        const minter_role_ldg = await this.ledgity_token_deployed.MINTER_ROLE();
        console.log('minter role :', minter_role_ldg);


        this.capsa_swap = await hre.ethers.getContractFactory("CapsaSwap");
        this.capsa_swap_deployed = await this.capsa_swap.deploy
        (
            this.usd_deployed.address,
            this.capsa_token_deployed.address,
            this.fundWalletCapsa.address,
            this.feeWalletCapsa.address
        );
        console.log("capsa swap: " + this.capsa_swap_deployed.address);

        this.ledgity_swap = await hre.ethers.getContractFactory("ldgSwap");
        this.ledgity_swap_deployed = await this.ledgity_swap.deploy
        (
            this.usd_deployed.address,
            this.capsa_swap_deployed.address,
            this.capsa_token_deployed.address,
            this.ledgity_token_deployed.address,
            this.fundWalletLDG.address,
            this.feeWalletLDG.address,
            this.feeRoleLDG.address
        );
        console.log("ledgity swap: " + this.ledgity_swap_deployed.address);

        console.log('###################');

        await this.capsa_token_deployed.grantRole(minter_role_capsa, this.capsa_swap_deployed.address); // Give ROLE to mint of the both contract
        await this.ledgity_token_deployed.grantRole(minter_role_ldg, this.ledgity_swap_deployed.address); // Give ROLE to mint of the both contract

        await this.usd_deployed.connect(this.testWallet).mint(this.testWallet.address, 100000000); // mint usd to test the contract
        await this.usd_deployed.connect(this.testWallet).approve(this.ledgity_swap_deployed.address, 100000000); // approve the usd on ldg swap

        await this.usd_deployed.connect(this.fundWalletCapsa).approve(this.capsa_swap_deployed.address, 100000000) // fund wallet capsa approve 100$ token to the capsa swap
        await this.ledgity_token_deployed.connect(this.testWallet).approve(this.ledgity_swap_deployed.address, 100000000) // test wallet approve 100 ldg token to the smart contract
        await this.capsa_token_deployed.connect(this.fundWalletLDG).approve(this.ledgity_swap_deployed.address, 100000000) // fund wallet LDG approve 100 ldg token to the smart contract

    });

    it('price should be at 1000000', async function() {
        let price = await this.ledgity_swap_deployed.myPrice();
        expect(JSON.parse(price)).to.equal(1 * this.decimals);
    });

    it('try to withdraw and the fund wallet has not enough allowance', async function() {
        await this.capsa_token_deployed.connect(this.fundWalletLDG).approve(this.ledgity_swap_deployed.address, 500000) // fund wallet LDG approve 100 ldg token to the smart contract
        await this.ledgity_swap_deployed.connect(this.testWallet).deposit(1000000);
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).withdraw(1000000)).to.be.revertedWith('The fund wallet has not allowed enough CAPSA Token on the contract to spend it');
        await this.capsa_token_deployed.connect(this.fundWalletLDG).approve(this.ledgity_swap_deployed.address, 100000000) // fund wallet LDG approve 100 ldg token to the smart contract
        await this.ledgity_swap_deployed.connect(this.testWallet).withdraw(1000000);
    });

    it('it should not be possible to change any of the set functions because i\'m not the owner', async function() {
        let Fee = 100;
        let PeriodFee = 120; // 120 sec
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).setToken(this.testWallet.address)).to.be.revertedWith('Ownable: caller is not the owner');
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).setTokenUSD(this.testWallet.address)).to.be.revertedWith('Ownable: caller is not the owner');
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).setFeeWallet(this.testWallet.address)).to.be.revertedWith('Ownable: caller is not the owner');
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).setFee(Fee)).to.be.revertedWith('Ownable: caller is not the owner');
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).setFeePeriod(PeriodFee, 360)).to.be.revertedWith('Ownable: caller is not the owner');
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).setFundWallet(this.testWallet.address)).to.be.revertedWith('Ownable: caller is not the owner');
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).pause_deposit()).to.be.revertedWith('Ownable: caller is not the owner');
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).pause_withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('it should be possible to deposit 50$ usd', async function() {
        const depositAmount = 50 * this.decimals;
        await this.ledgity_swap_deployed.connect(this.testWallet).deposit(depositAmount);
        const balance_capsa = await this.capsa_token_deployed.balanceOf(this.fundWalletLDG.address);
        const balance_ldg = await this.ledgity_token_deployed.balanceOf(this.testWallet.address);
        const supply_ldg = await this.ledgity_token_deployed.totalSupply();
        const supply_capsa = await this.capsa_token_deployed.totalSupply();
        expect(JSON.parse(balance_capsa)).to.equal(depositAmount);
        expect(JSON.parse(balance_ldg)).to.equal(depositAmount);
        expect(JSON.parse(supply_capsa)).to.equal(50 * this.decimals);
        expect(JSON.parse(supply_ldg)).to.equal(50 * this.decimals);
    });

    it('it should be possible to withdraw 50$ usd', async function() {
        const withdrawAmount = 50 * this.decimals;
        await this.ledgity_swap_deployed.connect(this.testWallet).withdraw(withdrawAmount);
        const balance_fund_wallet = await this.capsa_token_deployed.balanceOf(this.fundWalletLDG.address);
        const balance_token_ldg = await this.ledgity_token_deployed.balanceOf(this.testWallet.address);
        const supply_ldg = await this.ledgity_token_deployed.totalSupply();
        const supply_capsa = await this.capsa_token_deployed.totalSupply();
        expect(JSON.parse(balance_fund_wallet)).to.equal(0);
        expect(JSON.parse(balance_token_ldg)).to.equal(0);
        expect(JSON.parse(supply_capsa)).to.equal(0);
        expect(JSON.parse(supply_ldg)).to.equal(0);
    });

    it('it should not be possible to take fee', async function() {
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).takeFee()).to.be.revertedWith('You don\'t have role to take fee');
    });

    it('it should be possible to deposit 1$ usd', async function() {
        const depositAmount = 1 * this.decimals;
        await this.ledgity_swap_deployed.connect(this.testWallet).deposit(depositAmount);
        const balance_fund_wallet = await this.capsa_token_deployed.balanceOf(this.fundWalletLDG.address);
        const balance_token_ldg = await this.ledgity_token_deployed.balanceOf(this.testWallet.address);
        expect(JSON.parse(balance_fund_wallet)).to.equal(depositAmount);
        expect(JSON.parse(balance_token_ldg)).to.equal(depositAmount);
    });

    it('it should be possible to take fee', async function() {
        await this.ledgity_swap_deployed.connect(this.feeRoleLDG).takeFee();
        this.current_date = Date.now();
        const balance_fee_wallet = await this.capsa_token_deployed.balanceOf(this.feeWalletLDG.address);
        expect(JSON.parse(balance_fee_wallet)).to.equal(55);
    });

    it('it should not be possible to take fee because it\'s to soon', async function() {
        await expect(this.ledgity_swap_deployed.connect(this.feeRoleLDG).takeFee()).to.be.revertedWith('You can\'t claim another fee right now wait until the end of the feePeriod');
        const balance_fee_wallet = await this.capsa_token_deployed.balanceOf(this.feeWalletLDG.address);
        expect(JSON.parse(balance_fee_wallet)).to.equal(55);
    });

    it('it should be possible to withdraw all', async function() {
        await this.ledgity_swap_deployed.connect(this.testWallet).withdraw(1 * this.decimals);
        const balance_usd = await this.usd_deployed.connect(this.testWallet).balanceOf(this.testWallet.address);
        expect(JSON.parse(balance_usd)).to.equal(99999945);
    });

    it('it should not be possible to deposit more than my current balance', async function() {
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).deposit(100 * this.decimals)).to.be.revertedWith('You need to have enough USD in your balance');
    });

    it('it should not be possible to withdraw more than my current balance', async function() {
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).withdraw(10 * this.decimals)).to.be.revertedWith('You don\'t have enough money to withdraw.');
    });

    it('it should not be possible to mint because i\'m not the minter address', async function() {
        const minter_role = await this.ledgity_token_deployed.connect(this.testWallet).MINTER_ROLE();
        const addr = this.testWallet.address.toLowerCase();
        await expect(this.ledgity_token_deployed.connect(this.testWallet).mint(this.testWallet.address, 10 * this.decimals)).to.be.revertedWith(`AccessControl: account ${addr} is missing role ${minter_role}`);
    });

    it('it should not be possible to mint ldg token when we paused the token', async function() {
        await this.ledgity_token_deployed.pause();
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).deposit(1 * this.decimals)).to.be.revertedWith('Pausable: paused');
        await this.ledgity_token_deployed.unpause();
    });

    it('it should not be possible to deposit usd when we pause that but it should be possible to withdraw', async function() {
        await this.ledgity_swap_deployed.connect(this.testWallet).deposit(1 * this.decimals);

        await this.ledgity_swap_deployed.pause_deposit()
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).deposit(1 * this.decimals)).to.be.revertedWith('The deposit is paused');

        await this.ledgity_swap_deployed.connect(this.testWallet).withdraw(1 * this.decimals);
        const balance_ldg = await this.ledgity_token_deployed.balanceOf(this.testWallet.address);
        expect(JSON.parse(balance_ldg)).to.equal(0);

        await this.ledgity_swap_deployed.pause_deposit();
    });

    it('it should not be possible to withdraw usd when we pause that but it should be possible to deposit', async function() {
        await this.ledgity_swap_deployed.connect(this.testWallet).deposit(1 * this.decimals);

        await this.ledgity_swap_deployed.pause_withdraw();
        await expect(this.ledgity_swap_deployed.connect(this.testWallet).withdraw(1 * this.decimals)).to.be.revertedWith('The withdraw is paused');

        await this.ledgity_swap_deployed.connect(this.testWallet).deposit(1 * this.decimals);
        let balance_ldg = await this.ledgity_token_deployed.balanceOf(this.testWallet.address);
        expect(JSON.parse(balance_ldg)).to.equal(2 * this.decimals);

        await this.ledgity_swap_deployed.pause_withdraw();

        await this.ledgity_swap_deployed.connect(this.testWallet).withdraw(1 * this.decimals);

        balance_ldg = await this.ledgity_token_deployed.balanceOf(this.testWallet.address);
        expect(JSON.parse(balance_ldg)).to.equal(1 * this.decimals);
    });

    it('the price should be x2', async function() {
        await this.ledgity_swap_deployed.myPrice();
        let actualPrice_capsa = await this.capsa_swap_deployed.getPrice();
        await this.capsa_swap_deployed.setCapital(1000055 * 2);
        actualPrice_capsa = await this.capsa_swap_deployed.getPrice();

        expect(await this.ledgity_swap_deployed.myPrice()).to.equal(2 * this.decimals);
    });

    it('after deposit 1$ and withdraw 1$ it should have the same amount of usd', async function() {
        const balance_usd_before = await this.usd_deployed.balanceOf(this.testWallet.address);
        await this.ledgity_swap_deployed.connect(this.testWallet).deposit(1 * this.decimals);
        await this.ledgity_swap_deployed.connect(this.testWallet).withdraw(0.5 * this.decimals);

        const balance_usd_after = await this.usd_deployed.balanceOf(this.testWallet.address);
        expect(balance_usd_before).to.equal(balance_usd_after);
    });

    it('it should change the duration when i take the fee', async function() {
        await this.ledgity_swap_deployed.setFeePeriod(2, 360);
    });

    it('change the set fee to 0.2% instead of 2% basically', async function() {
        await (this.ledgity_swap_deployed.setFee(200));
        while(1){
            let date = Date.now();
            if (date >= this.current_date + 2000){
                break;
            }
        }
        await this.ledgity_swap_deployed.connect(this.feeRoleLDG).takeFee();
        const balance_fee_wallet = await this.capsa_token_deployed.balanceOf(this.feeWalletLDG.address);
        expect(JSON.parse(balance_fee_wallet)).to.equal(60);
    });
});