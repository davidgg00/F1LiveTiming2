import { State } from "../interfaces/State.interface";
import { Ref } from "vue";
import { deepObjectMerge, parseCompressed } from "../utils";

export const processMessageData = async (data: string, state: Ref<State>) => {
  const linesArray = data.split("\n");
  for (let i = 0; i < linesArray.length; i++) {
    const line = linesArray[i].trim();
    if (line.length !== 0) {
      try {
        const lineJSON = JSON.parse(line);
        if (lineJSON.R) {
          if (lineJSON.R["CarData.z"]) {
            lineJSON.R["CarData"] = await parseCompressed(
              lineJSON.R["CarData.z"]
            );
          }
          if (lineJSON.R["Position.z"]) {
            lineJSON.R["Position"] = await parseCompressed(
              lineJSON.R["Position.z"]
            );
          }
          state.value = deepObjectMerge(state.value, lineJSON.R);
        }
        if (lineJSON.M) {
          for (const message of lineJSON.M) {
            if (message.M !== "feed") continue;
            let [field, value] = message.A;
            if (field === "CarData.z" || field === "Position.z") {
              const [parsedField] = field.split(".");
              field = parsedField;
              value = await parseCompressed(value);
            }
            state.value = deepObjectMerge(state.value, { [field]: value });
          }
        }
      } catch (e) {
        console.error(`Error parsing line: ${e}`);
      }
    }
  }
};
