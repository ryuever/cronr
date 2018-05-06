const workerFactory = function(pattern: string, CronrFn: any) {
  let job: any = undefined;
  const Cronr = CronrFn();

  addEventListener("message", e => {
    const { action } = e.data;

    switch (action) {
      case "start":
        job = new Cronr(pattern, () => {
          const toNum = (date: Date) => date.valueOf();
          const a = toNum(new Date());
          postMessage(
            JSON.stringify({
              triggerTime: a
            })
          );
        });

        job.start();
        break;

      case "stop":
        job.stop();
        break;
    }
  });
};

export default workerFactory;
