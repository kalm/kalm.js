declare module '@kalm/webrtc' {
    interface WebRTCConfig {
        peers?: Peer[]
    }

    type Peer = {
        candidate?: {
            candidate: string
            sdpMLineIndex: number
            sdpMid: string
        }
        type?: 'offer' | 'answer'
        sdp?: string
    }

    interface Socket {
        negociate: (params: { peer: Peer }) => Promise<Peer>
    }

    export default function ws(config?: WebRTCConfig): (config?: WebRTCConfig) => any;
}
