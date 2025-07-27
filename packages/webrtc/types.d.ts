declare module '@kalm/webrtc' {
  interface WebRTCConfig {
    /** The list of peers to connect with */
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
  };

  interface Socket {
    negociate: (params: { peer: Peer }) => Promise<Peer>
  }

  /**
     * Creates a WebRTC Transport
     */
  export default function ws(config?: WebRTCConfig): (config?: WebRTCConfig) => any;
}
