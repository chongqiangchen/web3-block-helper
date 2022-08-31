const dayjs = require('dayjs');

class BlockHelper {
    /**
     * @param provider
     * @param blockDiffTimestamp {{value: number, unit: 'seconds' | 'minutes' | 'hours'}}
     */
    constructor(provider, blockDiffTimestamp = {value: 3, unit: 'seconds'}) {
        this.provider = provider;
        this.DIFF_TIMESTAMP = this.transformBlockDiffTimestampToSeconds(blockDiffTimestamp);
    }

    async init(block) {
        this.curBlockNumber = block || await this.provider.getBlockNumber();
    }

    async getTimestamp() {
        if (!this.curBlockNumber) {
            throw new Error('BlockHelper not initialized');
        }
        return (await this.provider.getBlock(this.curBlockNumber)).timestamp;
    }

    /**
     * subtract block or date from current block
     * @param number
     * @param unit
     * @returns {Promise<dayjs | number>}
     */
    async subtract(number, unit) {
        if (!this.curBlockNumber) {
            throw new Error('BlockHelper not initialized');
        }

        if (unit === 'block') {
            const timestamp = (await this.provider.getBlock(this.curBlockNumber - number || 0)).timestamp;
            return dayjs.unix(timestamp);
        }

        const curTimestamp = await this.getTimestamp();
        const preTimestamp = dayjs.unix(curTimestamp).subtract(number, unit).unix();
        const diffTimestamp = curTimestamp - preTimestamp;
        const preBlock = Math.ceil(this.curBlockNumber - diffTimestamp / this.DIFF_TIMESTAMP);
        return await this.correctBlock(preBlock, preTimestamp);
    }

    /**
     * add block or date from current block (forecast)
     * @param number
     * @param unit
     * @returns {Promise<dayjs | number>}
     */
    async add(number, unit) {
        if (!this.curBlockNumber) {
            throw new Error('BlockHelper not initialized');
        }

        const curTimestamp = await this.getTimestamp();
        if (unit === 'block') {
            const nextTimestamp = curTimestamp + number * 3;
            return dayjs.unix(nextTimestamp);
        }

        const nextTimestamp = dayjs.unix(curTimestamp).add(number, unit).unix();
        const diffTimestamp = nextTimestamp - curTimestamp;
        return Math.ceil(this.curBlockNumber + diffTimestamp / this.DIFF_TIMESTAMP);
    }

    /**
     * get block number
     * @returns {Promise<number>}
     */
    async now() {
        return await this.provider.getBlockNumber();
    }

    /**
     * get current block timestamp
     * @param startBlock
     * @param endBlock
     * @returns {Promise<number>}
     */
    async getDiffTimestamp(startBlock, endBlock) {
        const startTimestamp = (await this.provider.getBlock(startBlock)).timestamp;
        const endTimestamp = (await this.provider.getBlock(endBlock)).timestamp;
        return endTimestamp - startTimestamp;
    }

    /**
     * correct block number with expect timestamp
     * @param preBlock {number} must be less than current block number
     * @param expectTimestamp {number} must be less than current block timestamp
     * @returns {Promise<number>}
     */
    async correctBlock(preBlock, expectTimestamp) {
        const actualBlock = await this.provider.getBlock(preBlock);
        const actualTimestamp = actualBlock.timestamp;
        const diffTimestamp = expectTimestamp - actualTimestamp;
        if ((diffTimestamp > 0 && diffTimestamp < this.DIFF_TIMESTAMP) || (diffTimestamp < 0 && diffTimestamp > -this.DIFF_TIMESTAMP)) {
            return preBlock;
        }
        const nextBlock = Math.ceil(preBlock + diffTimestamp / this.DIFF_TIMESTAMP);
        return await this.correctBlock(nextBlock, expectTimestamp);
    }

    /**
     * transform blockDiffTimestamp to seconds
     * @param blockDiffTimestamp {{value: number, unit: 'seconds' | 'minutes' | 'hours'}}
     * @returns {number}
     */
    transformBlockDiffTimestampToSeconds(blockDiffTimestamp = {value: 3, unit: 'seconds'}) {
        if (blockDiffTimestamp.unit === 'seconds') {
            return blockDiffTimestamp.value;
        }
        if (blockDiffTimestamp.unit === 'minutes') {
            return blockDiffTimestamp.value * 60;
        }
        if (blockDiffTimestamp.unit === 'hours') {
            return blockDiffTimestamp.value * 60 * 60;
        }
    }
}

module.exports = BlockHelper;