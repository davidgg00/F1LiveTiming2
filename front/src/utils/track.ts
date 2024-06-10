
interface TrackStatusObject {
    message: string;
    class: string;
    trackColor: string;
    bySector?: boolean;
    hex: string;
}

interface MessageMap {
    [key: number]: TrackStatusObject;
}

export const getTrackStatusObject = (status: number): TrackStatusObject => {
    const messageMap: MessageMap = {
        0: { message: "Unknown", class: "yellow-flag", trackColor: "stroke-yellow-500", hex: "#f59e0c" },
        1: { message: "Track Clear", class: "green-flag", trackColor: "stroke-white", hex: "#34b981" },
        2: {
            message: "Yellow Flag",
            class: "yellow-flag",
            trackColor: "stroke-yellow-500",
            bySector: true,
            hex: "#f59e0c",
        },
        3: { message: "Flag", class: "yellow-flag", trackColor: "stroke-yellow-500", bySector: true, hex: "#f59e0c" },
        4: { message: "Safety Car", class: "yellow-flag", trackColor: "stroke-yellow-500", hex: "#f59e0c" },
        5: { message: "Red Flag", class: "red-flag", trackColor: "stroke-red-500", hex: "#ef4444" },
        6: { message: "VSC Deployed", class: "yellow-flag", trackColor: "stroke-yellow-500", hex: "#f59e0c" },
        7: { message: "VSC Ending", class: "yellow-flag", trackColor: "stroke-yellow-500", hex: "#f59e0c" },
    };

    return status ? messageMap[status] : messageMap[0];
};