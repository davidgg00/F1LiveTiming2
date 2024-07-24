import { Ref } from "vue";
import { CarData } from "../interfaces/CarData.interface";
import { WelcomePosition } from "../interfaces/WelcomePosition.interface";
import { State } from "../interfaces/State.interface";
import { deepObjectMerge, parseCompressed } from "../utils";

interface LineJSON {
  R?: {
    CarData?: CarData;
    "CarData.z"?: string;
    Position?: WelcomePosition;
    "Position.z"?: string;
  };
  M?: Array<{
    M: string;
    A: [string, any];
  }>;
}

const useReadLines = (state: Ref<State>) => {
  const readLines = async () => {
    try {
      const response = await fetch("prueba.data.txt");
      if (!response.body) {
        console.error("The response body is null");
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      let chunk = await reader.read();

      while (!chunk.done) {
        result += decoder.decode(chunk.value, { stream: true });
        const linesArray = result.split("\n");
        for (let i = 0; i < linesArray.length - 1; i++) {
          const line = linesArray[i].trim();
          if (line.length !== 0) {
            const lineJSON: LineJSON = JSON.parse(line);
            if (lineJSON.R) {
              if (lineJSON.R["CarData.z"]) {
                lineJSON.R["CarData"] = parseCompressed(
                  lineJSON.R["CarData.z"]
                );
              }
              if (lineJSON.R["Position.z"]) {
                lineJSON.R["Position"] = parseCompressed(
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
                  value = parseCompressed(value);
                }
                state.value = deepObjectMerge(state.value, { [field]: value });
              }
            }
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }
        result = linesArray.pop() || "";
        chunk = await reader.read();
      }

      console.log("Salgo!!");
      if (result.trim().length !== 0) {
        const lineJSON: LineJSON = JSON.parse(result.trim());
        if (lineJSON.R) {
          console.log("Processing last line:", result);
        }
      }
    } catch (error) {
      console.error("Error al leer el archivo:", error);
    }
  };

  return {
    readLines,
  };
};

export default useReadLines;
