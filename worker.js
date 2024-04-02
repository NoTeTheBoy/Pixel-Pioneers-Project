onmessage = (event) => {
    console.log('Message received');
         if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const pos = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    };
                    
                    console.log(pos);
                },
                () => {
                    
                },
                );
            } else {
                console.log('no geolocation');
            }
        }  
   