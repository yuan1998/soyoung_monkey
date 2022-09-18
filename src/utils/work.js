const {log} = console;

export const work = async (fnList = [], max = 3, taskName = 'default') => {
    if (fnList && !fnList.length) return;
    log(`=> 开始执行多个异步任务，最大并发数： ${max}`);

    const startTime = new Date().getTime(); // 记录任务执行开始时间

    let result = [];
    // 任务执行程序
    const schedule = async (index) => {
        return new Promise(async (resolve) => {
            const fn = fnList[index];
            if (!fn) return resolve();

            // 执行当前异步任务
            result.push(await fn());
            // 执行完当前任务后，继续执行任务池的剩余任务
            await schedule(index + max);
            resolve();
        });
    };

    // 任务池执行程序
    const scheduleList = new Array(max)
        .fill(0)
        .map((_, index) => schedule(index));
    // 使用 Promise.all 批量执行
    const r = await Promise.all(scheduleList);

    const cost = (new Date().getTime() - startTime) / 1000;
    log(`=> 所有数据获取完成，最大并发数： ${max}，耗时：${cost}s`);
    return result;
};
