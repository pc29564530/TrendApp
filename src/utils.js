import React, {useCallback, useEffect, useState} from "react";
import Ably from 'ably';


const App = () => {
    const [ablyClient, setAblyClient] = useState(null);

    const initializeAbly  = async () => {
        const ably = new Ably.Realtime('_V-fXQ.Fcqk2w:IC3H1cQFMQnNCjShXDy4_kIie0S5OY_N1LMpMrAukZw')
        setAblyClient(ably)
        return ably
    }

    const handlePostEvent = 
        async () => {
            if(ablyClient ===  null) {
                const ably = await initializeAbly();
                setAblyClient(ably);
            }

            await initializeAbly()

            console.log(ablyClient)

            if (ablyClient != null) {
               console.log(ablyClient)
            }
        }

    useEffect( async ()=> {
        initializeAbly()
        // await handlePostEvent()
    }, [initializeAbly])

    return (
        <div>
            <form onSubmit={ handlePostEvent}>
                <textarea name="description" placeholder="Write about the trending event" />
                <button type="submit">Post</button>
              </form>
        </div>
    );
}

export default App;