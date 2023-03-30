import { OrbitControls, CameraShake } from '@react-three/drei'
import { useControls } from 'leva'
import { Particles } from './Particles'
import { createDevice } from '@rnbo/js';
import { useState, useEffect } from 'react';
import patcher from './patch.export.json';

export default function App() {
    const [device, setDevice] = useState(null);
    const [particlesProps, setParticlesProps] = useState({});

    const [focus, setFocus] = useState(5.1);
    const [speed, setSpeed] = useState(2);
    const [aperture, setAperture] = useState(1.8)
    const [fov, setFov] = useState(200)
    const [curl, setCurl] = useState(0.25)

    // const props = useControls({
    //     focus: { value: 5.1, min: 3, max: 7, step: 0.01 },
    //     speed: { value: 100, min: 0.1, max: 100, step: 0.1 },
    //     aperture: { value: 1.8, min: 1, max: 5.6, step: 0.1 },
    //     fov: { value: 50, min: 0, max: 200 },
    //     curl: { value: 0.25, min: 0.01, max: 0.5, step: 0.01 }
    // })

    useEffect(() => {
        async function initDevice() {
            const context = new (AudioContext || webkitAudioContext)();

            window.addEventListener('click', () => {
                context.resume();
            })
            const gain = context.createGain().connect(context.destination);
            const newDevice = await createDevice({ context, patcher });

            await fetch(process.env.PUBLIC_URL + '/process1.mp3')
                .then(response => response.arrayBuffer())
                .then(buffer => context.decodeAudioData(buffer))
                .then(audioBuf => newDevice.setDataBuffer('x', audioBuf))

            newDevice.messageEvent.subscribe(e => {
                if (e.tag === 'focus') {
                    setFocus(e.payload)
                } 
                else if (e.tag === 'speed') {
                    setSpeed(e.payload)
                } 
                else if (e.tag === 'aperture') {
                    setAperture(e.payload)
                }
                else if (e.tag === 'fov') {
                    setFov(e.payload)
                }
                else if (e.tag === 'curl') {
                    setCurl(e.payload)
                }

            });
            newDevice.node.connect(gain);
            setDevice(newDevice);
        }
        initDevice();
    }, []);
    
    return (
        <>
        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} zoomSpeed={0.1} />
        <CameraShake yawFrequency={1} maxYaw={0.05} pitchFrequency={1} maxPitch={0.05} rollFrequency={0.5} maxRoll={0.5} intensity={0.2} />
        <Particles focus={focus} speed={speed} aperture={aperture} fov={fov} curl={curl} />
        {/* <Particles {...props} /> */}
        </>
        )
    }
    