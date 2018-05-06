const workerFactory = function(pattern: string, CronrFn: any) {
  let job: any = undefined;
  const Cronr = CronrFn();
  let hit = 0;

  addEventListener("message", e => {
    const { action } = e.data;

    switch (action) {
      case "start":
        job = new Cronr(pattern, () => {
          postMessage({
            action: "trigger",
            triggerAt: new Date(),
            nextTick: job.nextTick,
            hit: ++hit,
            status: job.status
          });
        });

        job.start();
        break;

      case "stop":
        job.stop();
        postMessage({
          action: "updateStatus",
          status: job.status
        });
        break;

      case "resume":
        job.resume();
        postMessage({
          action: "updateStatus",
          status: job.status
        });
        break;

      case "clear":
        job.clear();
        postMessage({
          action: "updateStatus",
          status: job.status
        });
        break;

      case "restart":
        job.restart();
        postMessage({
          action: "updateStatus",
          status: job.status
        });
        break;

      case "terminate":
        close();
        break;

      case "queryNextTick":
        postMessage(job.nextTick);
        break;
    }
  });
};

export default workerFactory;
