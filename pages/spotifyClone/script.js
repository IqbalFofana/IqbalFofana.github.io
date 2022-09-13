const myToken = "BQDF-9cp8jLPE0C5qUnyfrSPb5_qltUPA9FZv9odVp1NRMJojwvZNQ1viRU1GATIZdDmTkzrhFcy2Pn3xFMIi3BzIfF8fDeqCEjh_DPp2KFrIGEhrKLXAgDmFFVbvLydTxFRYh1bHrbekKGQ6Ge-Ww8d4qegde66Pi5psCSbYg_CKfT0GOLn2VPkTmBP9REMf4c";
//API Module
const APIController = (function() {
    
/*     //the function has 2 variables to get the token
    const clientId = 'ADD YOUR CLIENT ID';
    const clientSecret = 'ADD YOUR CLIENT SECRET';

    // private methods
    const getToken = async () => { //POST REQUEST

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
    } */
    const getNewAlbums = async (myToken) => {
        const result = await fetch('https://api.spotify.com/v1/browse/new-releases',{
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + myToken}
        });
        const data = await result.json();
        return data.albums.items;
    }

    const getAlbum = async(myToken, albumId) => {
        const result = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
    }

    const getGenres = async (token) => {

        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.categories.items;
    }


    
    const _getPlaylistByGenre = async (token, genreId) => {

        const limit = 10;
        
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) => {

        const limit = 10;

        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }

    const _getTrack = async (token, trackEndPoint) => {

        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    return {
        getNewAlbums(myToken){
            return getNewAlbums(myToken);
        },

        getToken() {
            return getToken();
        },
        getGenres(token) {
            return getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        }
    }
})(); //to call function immediatly


   // document.write( await APIController.getNewAlbums(myToken));
   const albumName =  APIController.getNewAlbums(myToken);
    console.log(albumName);



//UI Module
const UIController = (function(){

    //object to hold references to hmtl selectors, so if we change some classes o ids in html file, we change just  DOM elemenets 
    const DOMElements = {
        divContainer: '.container',
        divCard: '.card',
        divTrack: '.track',
        divCardNames: '.card-names'
    }

    //public methods
    return {
        inputField(){
            return{
                container : document.querySelector(DOMElements.divContainer),
                card : document.querySelector(DOMElements.divCard),
                cardnames : document.querySelector(DOMElements.divTrack),
                track : document.querySelector(DOMElements.divCardNames)
            }
        },

        createCard(albumName, artistName, imageUrl) {
            const html = `  <div class="card">
                                <img src="${imageUrl}" alt="">
                                <div class="card-names">
                                    <h4><b>${albumName}</b></h4>
                                    <b>${artistName}</b>
                                </div>
                            </div>`;
            document.querySelector(DOMElements.divContainer).insertAdjacentHTML('beforeend', html);
        }
    }


    //create Album detail
    //createAlbumDetail(img, title, artist){

    //}

})();


const APPController = (function(UICtrl, APICtrl){
    //get new Albums on page load
    const loadNewAlbums = async () => {
        const albumItems = await APIController.getNewAlbums(myToken);
        //UI ....
        for(let i=0; i<albumItems.length; i++){
            console.log("Nome Album :"+ albumItems[i].name + " Nome Artista : "+
            albumItems[i].artists[0].name +" Image : "+ albumItems[i].images[1].url
            );
            UICtrl.createCard(albumItems[i].name, albumItems[i].artists[0].name, albumItems[i].images[1].url);
        }
        
        
    }

    return {
        init(){
            loadNewAlbums();
        }
    }
})(UIController,APIController); 

APPController.init();