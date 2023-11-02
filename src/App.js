import React, { useCallback, useEffect, useState, useRef } from "react";
import Ably from 'ably';
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';


mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

const App = () => {
    const [ablyClient, setAblyClient] = useState(null);
    const [map,setMap] = useState(null);
    const [eventData, setEventData] = useState(null)
    const [marker, setMarker] = useState([]);
    const markerRef = useRef(marker)
    useEffect((e) => {
      initializeMap();
    }, [])
    useEffect(() => {
      const handleClick = () => {
        console.log("entering")
        initializeMap();
        fetchData();
      };
    
      map?.on("click", handleClick);
    }, [map]);
    useEffect(() => {
      markerRef.current = marker
    }, [marker])
    useEffect(() => {
      console.log("Useeffect: ", marker.length)
      if (map && marker.length > 0) {
        marker.forEach((m) => m.addTo(map));
      }
    }, [map, marker]);

    const initializeAbly = async () => {
        const ably = new Ably.Realtime(process.env.API_KEY)
        setAblyClient(ably)
        return ably
    }

    const fetchData = async () => {
      try {
        console.log("LIne no 23: fetchData: ", eventData)
        const ablyClient = await initializeAbly();
        console.log("Line no 24: ", ablyClient)
        const channel = ablyClient.channels.get('event-post');
        console.log("Channel: ", channel)
        console.log("Line no 28 EventData: ", eventData)
        channel.subscribe('new-event', (event) => {
          if (eventData) {
            const { latitude, longitude } = eventData.location;
            const description = event.data.description;
            console.log("long: ", longitude);
            console.log("lati: ", latitude);
            if (map) {
              const mark = new mapboxgl.Marker()
                .setLngLat([longitude, latitude])
                .setPopup(new mapboxgl.Popup().setHTML(`<p>${description}</p>`))
                .addTo(map);
              setMarker((prevMarker) => [...prevMarker, mark]);
              console.log("Mark: ", mark)
            }
          }
        });
      } catch (error) {
        console.error("Error initializing ably: ", error)
      }
    };
    

    const initializeMap = async () => {
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const {latitude, longitude} = position.coords;
          const map = new mapboxgl.Map({
            container:'map',
            style:'mapbox://styles/mapbox/streets-v11',
            center: [latitude, longitude],
            zoom: 0.5,
          });
          setMap(map);

          map.on('click', (e) => {
            const data = {
              location: {
                latitude: e.lngLat.lat,
                longitude: e.lngLat.lng, 
              },
              time: new Date().toLocaleString(),
            };
            console.log(data);
            console.log("Data: ", data)
            setEventData(data)
            console.log("Line no 72 HandlePost: ", eventData)
            if(ablyClient) {
              handlePostEvent();
            }
            e.preventDefault();
            console.log("Line no 75 HandlePost: ", eventData)
          })
        })
      } else {
        console.error('Geolocation is not supported by the browser');
      }
    };

    const handlePostEvent = async (e) => {
      if (e) {
        e.preventDefault();
      }
      console.log("Line no 87 HandlePost: ", eventData)
      var ably;
        if (ablyClient === null) {
            ably = await initializeAbly();
        }
        console.log("Line no 92 HandlePost: ", eventData)
        if (ably !== null) {
          try {
            const channel = ablyClient.channels.get('event-post');
            const formData = new FormData(e.target);
            const event = {
              description: formData.get('description'),
            };

            channel.publish('new-event',  event);
            console.log("Line no 101 HandlePost: ", eventData)
          } catch (e) {
            console.error('Error publishing event: ', e)
          }
        }
    }
    const handleFormClick = (e) => {
      e.preventDefault();
      e.stopPropagation(); 
    }
    

    return (
      <div>
      <div className="header">
        <h>Trendgram</h>
      </div>
      <div className="subContainer1">
        <div id="map" className="map">

        </div>
      </div>
      <div className='subContainer2'>
       
            <div className="modal">
            <form onSubmit={handlePostEvent}>
              <textarea name="description" placeholder="Write about the trending event" />
              <button type="submit">Post</button>
            </form>
          </div>
      
        
      </div>
    </div>
    );
}

export default App;
