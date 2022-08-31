## Block Helper

> help users quickly find blocks by date

### Quick start

```
    // install
    npm install block-helper

    // how to use
    const provider = ethers.providers.JsonRpcProvider(xxx);

    // default block diff timestamp 3s (bsc)
    const blockDiffTimestamp = {
        value: 3,
        unit: 'seconds', // 'seconds' | 'minutes' | 'hours'
    }
    const blockHelper = new BlockHelper(provider, blockDiffTimestamp);

    // default current block number
    await blockHelper.init(/* custom block */)

    // get next 7 days block
    const featBlock = await blockHelper.add(7, 'day');
    console.log(featBlock);

    // get pre 7 days block
    await preBlock = await blockHelper.subtract(7, 'day');
    console.log(preBlock);
```

### API

**add**
> referenc dayjs add

*special unit*: 'block'

```
    // will returns dayjs instance
    const dateObj = await blockHelper.add(1, 'block');
    const date = dateObj.format();
```

**subtract**
> referenc dayjs subtract

*special unit*: 'block'

```
    // will returns dayjs instance
    const dateObj = await blockHelper.subtract(1, 'block');
    const date = dateObj.format();
```

### TODO

- [ ] unit test
