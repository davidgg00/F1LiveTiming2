// utils/websocket.ts

import axios from 'axios';

interface NegotiationData {
    Url: string;
    ConnectionToken: string;
    ConnectionId: string;
    KeepAliveTimeout: number;
    DisconnectTimeout: number;
    ConnectionTimeout: number;
    TryWebSockets: boolean;
    ProtocolVersion: string;
    TransportConnectTimeout: number;
    LongPollDelay: number;
    Cookie: string;
}

// Función para negociar la conexión
export async function negotiate(): Promise<NegotiationData> {
    const hub = encodeURIComponent(JSON.stringify([{ name: "Streaming" }]));
    const url = `/api/signalr/negotiate?connectionData=${hub}&clientProtocol=1.5`;
    const resp = await axios.get(url);
    const cookie = resp.headers['set-cookie']?.join('; ') || '';
    resp.data.Cookie = cookie;
    return resp.data;
}

// Función para conectarse al WebSocket
export function connectWebSocket(connectionToken: string, cookie: string): WebSocket {
    const hub = encodeURIComponent(JSON.stringify([{ name: "Streaming" }]));
    const encodedToken = encodeURIComponent(connectionToken);
    const url = `wss://livetiming.formula1.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${encodedToken}&connectionData=${hub}`;

    console.log('url', url);
    return new WebSocket(url);
}

export function getUrlWS(connectionToken: string, cookie: string): string {
    const hub = encodeURIComponent(JSON.stringify([{ name: "Streaming" }]));
    const encodedToken = encodeURIComponent(connectionToken);
    const url = `wss://livetiming.formula1.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${encodedToken}&connectionData=${hub}`;

    return url;
}
