import workerFactory from "./worker/workerFactory";
import miscCronr from "./worker/miscCronr";

const CronrWorker = (pattern: string) => {
  return new Worker(
    window.URL.createObjectURL(
      new Blob([
        "(" + workerFactory + ')("' + pattern + '", ' + miscCronr + ")"
      ])
    )
  );
};

export default CronrWorker;
