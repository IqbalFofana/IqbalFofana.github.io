const myToken = "BQAXkb8FkI2DXzYW_QR7joP-YBjK9Pymi81smP7Afeo9mYvkSSW2uu_tfDOaxVRnrXe0uwzkH-KMaojzzFlTSxwJZyZQWDNU4dOyExAyIW7alKZ6qaIEdWMLAwlvAFFirE-ufU72zBmy07lXo7yi6_rWUSLTBzWQiPM-GxgIDhsduefpJ5eX_1e6y1g7OFKnj_M";
//API Module
const APIController = (function() {
    
     //the function has 2 variables to get the token
    const clientId = '143f27d1e8624167857fb64162b919de';
    const clientSecret = '7b76472d2f64452889571b14f966fca7';

    // private methods
    const _getToken = async () => { //POST REQUEST

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret) //base64 enconding string rappresentation
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();  //the result is a json object and we store it in a variable call data
        return data.access_token;  
    } 
    const _getNewAlbums = async (token) => {
        const result = await fetch('https://api.spotify.com/v1/browse/new-releases',{
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        const data = await result.json();
        return data.albums.items;
    }

    const _getTracks = async(token, albumId) => {
        const limit = 30;
        const result = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }



/*     const oldGetTracks = async (token, tracksEndPoint) => {

        const limit = 10;

        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
        console.log(data.items);
    } */

    const getTrack = async (token, trackEndPoint) => {

        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    return {
        getToken(){
            return _getToken();
        },
        getNewAlbums(token){
            return _getNewAlbums(token);
        },
        getTracks(token, albumId) {
            return _getTracks(token, albumId);
        },

    }
})(); //to call function immediatly


//UI Module
const UIController = (function(){

    //object to hold references to hmtl selectors, so if we change some classes o ids in html file, we change just  DOM elemenets 
    const DOMElements = {
        divContainer: '.container',
        divContainerTracks: '.container-tracks',
        divContainerCards: '.container-cards',
        divCard: '.card',
        divCardNames: '.card-names',
        divTrack: '.track',
        divButtonBack: '#button-back'
    }

    //public methods
    return {
        inputField(){
            return{
                container : document.querySelector(DOMElements.divContainer),
                containerCards : document.querySelector(DOMElements.divContainerCards),
                containerTracks : document.querySelector(DOMElements.divContainerTracks),
                card : document.querySelectorAll(DOMElements.divCard),
                cardnames : document.querySelectorAll(DOMElements.divCardNames),
                track : document.querySelectorAll(DOMElements.divTrack),
                buttonBack : document.querySelector(DOMElements.divButtonBack)
            }
        },

        createCard(albumName, artistName, imageUrl, albumId) {
            const html = `  <div class="card" id="${albumId}" >
                                <img src="${imageUrl}" alt="">
                                <div class="card-names">
                                    <b>${albumName}</b>
                                    <p>${artistName}</p>
                                </div>
                            </div>`;
            document.querySelector(DOMElements.divContainerCards).insertAdjacentHTML('beforeend', html); //insert element as the last child of paretn element (containerCards)
        },

        createTrack(trackName, trackNumber, trackDuration){
            const html =  ` <div class="track" onclick="">
                                <span class="track-number">${trackNumber}</span>
                                <span>${trackName}</span>
                                <span>${this.millsToMinutes(trackDuration)}</span>
                            </div>`;
                
            document.querySelector(DOMElements.divContainerTracks).insertAdjacentHTML('beforeend', html);                
        },

        createAlbumHeader(albumName, artistName, imageUrl){
            const htmlFirstLine = ` <div class="album-profile" ><img src="${imageUrl}" alt="">
            <div class="card-names-profile"><b>${albumName}</b><p>${artistName}</p></div></div>
            <div class="first-line"><span>#</span><span>TITLE</span><span class="material-symbols-outlined">schedule</span></div><hr>`;
            document.querySelector(DOMElements.divContainerTracks).insertAdjacentHTML('beforeend', htmlFirstLine);
        },

        hideContainerTracks(){
            this.inputField().containerTracks.style.display = "none";
        },

        showContainerTracks(){
            this.inputField().containerTracks.style.display = "block";
        },

        storeToken(value) {
            document.querySelector(DOMElements.divContainer).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.divContainer).value
            }
        },

        millsToMinutes(mills){
            var minutes = Math.floor(mills / 60000);
            var seconds = ((mills % 60000) / 1000).toFixed(0);
            return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        },

        resetCards(){
            this.inputField().containerCards.innerHTML = '';
        }, 

        resetTracks(){
            this.inputField().containerTracks.innerHTML = '';
        }
    }


    //create Album detail
    //createAlbumDetail(img, title, artist){

    //}

})();


const APPController = (function(UICtrl, APICtrl){

    // get input field object ref
    const DOMInputs = UICtrl.inputField();

    //get new Albums on page load
    const loadNewAlbums = async () => {
        const token = await APICtrl.getToken();
        UICtrl.storeToken(token);
        const albumItems = await APICtrl.getNewAlbums(token);
        //UI ....
        for(let i=0; i<albumItems.length; i++){
            UICtrl.createCard(albumItems[i].name, albumItems[i].artists[0].name, albumItems[i].images[1].url, albumItems[i].id);
        }    
    }

    const loadTraks = async (token, albumId) => {
        const trackItems = await APICtrl.getTracks(token, albumId);
            console.log(trackItems);
        
        
        
        for(let i=0; i<trackItems.length; i++){
            UICtrl.createTrack(trackItems[i].name, trackItems[i].track_number, trackItems[i].duration_ms);
        } 
    }

    const getCardElements = async (albumId) =>{
        var parent = document.getElementById(albumId);

        var imageUrl = parent.children[0].src;
        var albumName  = parent.children[1].children[0].innerHTML; 
        var artisName  = parent.children[1].children[1].innerHTML; 
        return {
            albumName,
            artisName,
            imageUrl 
        }
    }


    DOMInputs.containerCards.addEventListener('click', async(e) => {  
        e.preventDefault(); //prevent page reset 
        const token = UICtrl.getStoredToken().token;    
        const albumId = e.target.id;
        
        UICtrl.createAlbumHeader((await getCardElements(e.target.id)).albumName, (await getCardElements(e.target.id)).artisName, (await getCardElements(e.target.id)).imageUrl);
        loadTraks(token, albumId);

        UICtrl.resetCards(); 
        UICtrl.showContainerTracks();

    }, true);
    


    DOMInputs.buttonBack.addEventListener('click', async(e) => {  
        e.preventDefault(); //prevent page reset 
        UICtrl.resetTracks();
        loadNewAlbums();

    });


    return {
        init(){
            UICtrl.hideContainerTracks(); //1° hide the container-tracks div
            loadNewAlbums();
        }
    }

})(UIController,APIController); 

 APPController.init();


/* const prova = UIController.inputField();
prova.buttonBack.addEventListener('click', async(e) => {   
    console.log("CLICCCATO");
    
}) */


    //togliere le card
    // UIController.resetCard();

    //salvare id dell'album
    
    //mostrare dentro il container un div con immagine, nome album e nome artista
    //mostrare TITOLO e durata
    //mostrare un hr da separatore
    //mostrare un div con   n° traccia | nome brano | durata (for each track)



//showTracks();