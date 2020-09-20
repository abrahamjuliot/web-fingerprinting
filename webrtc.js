const getWebRTCData = () => {
    return new Promise(resolve => {
        try {
            const rtcPeerConnection = (
                window.RTCPeerConnection ||
                window.webkitRTCPeerConnection ||
                window.mozRTCPeerConnection ||
                window.msRTCPeerConnection
            )
            if (!rtcPeerConnection) {
                return resolve(undefined)
            }
            const connection = new rtcPeerConnection({
                iceServers: [{
                    urls: ['stun:stun.l.google.com:19302?transport=udp']
                }]
            }, {
                optional: [{
                    RtpDataChannels: true
                }]
            })
            let success = false
            connection.onicecandidate = e => {
                const candidateEncoding = /((udp|tcp)\s)((\d|\w)+\s)((\d|\w|(\.|\:))+)(?=\s)/ig
                const connectionLineEncoding = /(c=IN\s)(.+)\s/ig
                if (!e.candidate) {
                    return
                }
                success = true
                const { candidate } = e.candidate
                const encodingMatch = candidate.match(candidateEncoding)
                if (encodingMatch) {
                    const { sdp } = e.target.localDescription
                    const ipAddress = e.candidate.address
                    const candidateIpAddress = encodingMatch[0].split(' ')[2]
                    const connectionLineIpAddress = sdp.match(connectionLineEncoding)[0].trim().split(' ')[2]
                    const successIpAddresses = [
                        ipAddress,
                        candidateIpAddress,
                        connectionLineIpAddress
                    ].filter(ip => ip != undefined)
                    const data = {
                        ['ip address']: ipAddress,
                        ['candidate encoding']: candidateIpAddress,
                        ['connection line']: connectionLineIpAddress
                    }
                    return resolve({
                        ...data
                    })
                }
            }
            const givenDelay = 1000
            setTimeout(() => {
                if (!success) {
                    console.error(`Given ${givenDelay} ms, RTCPeerConnection failed`)
                    return resolve(undefined)
                }
            }, givenDelay)
            connection.createDataChannel('creep')
            connection.createOffer()
                .then(e => connection.setLocalDescription(e))
                .catch(error => console.log(error))
        } catch (error) {
            console.error('RTCPeerConnection failed')
            return resolve(undefined)
        }
    })
}

(async function() {
    const data = await getWebRTCData()
    console.log(data)
})()
