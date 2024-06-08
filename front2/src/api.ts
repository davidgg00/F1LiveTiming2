import { ref } from 'vue';
import { parseCompressed, deepObjectMerge } from './utils';
export const readLines = async () => {
    try {
        const response = await fetch("prueba.data.txt");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';
        let chunk = await reader.read();

        while (!chunk.done) {
            result += decoder.decode(chunk.value, { stream: true });
            const linesArray = result.split('\n');
            // Process all lines except the last one
            for (let i = 0; i < linesArray.length - 1; i++) {
                const line = linesArray[i].trim();
                if (line.length !== 0) {
                    const lineJSON = JSON.parse(line);
                    if (lineJSON.R) {
                        const { DriverList } = lineJSON.R;
                        DriverListUpdated.value = DriverList;

                        if (lineJSON.R["CarData.z"])
                            lineJSON.R["CarData"] = parseCompressed(lineJSON.R["CarData.z"]);

                        if (lineJSON.R["Position.z"])
                            lineJSON.R["Position"] = parseCompressed(lineJSON.R["Position.z"]);

                        // Modifica state utilizando .value para asegurarte de que los cambios sean reactivos
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

                            // Modifica state utilizando .value para asegurarte de que los cambios sean reactivos
                            state.value = deepObjectMerge(state.value, { [field]: value });
                        }
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Store the last line for the next iteration
            result = linesArray.pop();

            // Read the next chunk
            chunk = await reader.read();
        }

        console.log('Salgo!!');
        // Process the last line if it exists
        if (result.trim().length !== 0) {
            const lineJSON = JSON.parse(result.trim());
            if (lineJSON.R) {
                const { DriverList } = lineJSON.R;
                DriverListUpdated.value = DriverList;
                console.log('Processing last line:', result);
            }
        }

        console.log('State');
    } catch (error) {
        console.error('Error al leer el archivo:', error);
    }
};