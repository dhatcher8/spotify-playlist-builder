import React, { Component } from 'react'

import {spotifyWebApi} from '../../pages/GetTokenRedirect';

var rpl = null;

export default class RecentlyPlayedComponent extends Component {
    constructor(){
        super();
        this.state = {
            playlistGenerationFailure : false,
            recentlyPlayedList : null,
            buttonIsActive: false,
            buttonText: "Save.",
            userID: "",
        }
        this.getTrackPlaylist();

    }
    
    getTrackPlaylist() {
        // console.log(spotifyWebApi.getAccessToken());
        spotifyWebApi.getMyRecentlyPlayedTracks({
            limit : 50
        }).then(
            function(data) {
                // newTrackPlaylist = data;
                // this.recentlyPlayedList = data;
                this.setState({ recentlyPlayedList : data.items})
                console.log(data.items);
                // console.log(this.recentlyPlayedList.items);
            }.bind(this),
            function (err) {
                console.error(err);
                this.setState({ playlistGenerationFailure : true });
            }.bind(this)
        );
        // console.log(newTrackPlaylist);
        // return newTrackPlaylist;
        console.log("we made it here");
        // console.log(recentlyPlayedList);
        // this.render();
    }

    onClick() {
        this.setState({ buttonIsActive: true });
        this.setState({ buttonText : "Playlist Saved!"}, this.getUserID);
    }

    getUserID() {
        spotifyWebApi.getMe().then(
            function(data) {
                // console.log(data);
                this.setState({ userID : data.id}, this.createPlaylist);
            }.bind(this),
            function (err) {
                console.error(err);
            }.bind(this)
        );
    }

    createPlaylist() {

        var today = new Date();
        var date = (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear();
        var playlistName = 'Recently Played Tracks - ' + date;

        spotifyWebApi.createPlaylist(this.state.userID, {
            "name": playlistName,
            "description": "Recently Played Tracks Playlist Made By You Choose, Muse",
            "public": true
        }).then(
            function(data) {
                this.setState({ newPlaylistData : data}, this.addSongsToPlaylist);
            }.bind(this),
            function (err) {
                console.error(err);
            }.bind(this)
        );
    }

    addSongsToPlaylist() {
        // console.log(globalPlaylist);
        // console.log(this.state.newPlaylistData);
        var trackURIs1 = [];
        var i;
        for (i = 0; i < 50; i++) {
            trackURIs1.push(this.state.recentlyPlayedList[i].track.uri);
        }

        // console.log(trackURIs1, trackURIs2);

        spotifyWebApi.addTracksToPlaylist(this.state.userID, this.state.newPlaylistData.id, trackURIs1).then(
            function(data) {
                // console.log(data);
                this.setState({ newPlaylistData : data}, this.addSongsToPlaylist);
            }.bind(this),
            function (err) {
                console.error(err);
            }.bind(this)
        );

    }
    
    render() {
        if (this.state.recentlyPlayedList == null) {
            if (this.state.playlistGenerationFailure) {
                return (
                    <div className="warning-logout-container">
                        <div className="warning-sub-container">
                            Uh oh, you've been logged out! Go back to the home screen and login!
                        </div>
                    </div>
                );
            }
            else {
                return(
                    <div className="background-div-navy">
                    </div>
                );
            }
        }
        else {
            var rpl = this.state.recentlyPlayedList;
            // console.log(rpl);
        }
        var i;
        console.log(rpl);
        for (i = 0; i < rpl.length; i++) {
            try {
                rpl[i].track.album.images[0].url = rpl[i].track.album.images[0].url;
            }
            catch {
                
                if (rpl[i].track.name == "") {
                    rpl.splice(i, 1);
                } else {
                    if (rpl[i].track.album.images.length < 1 || rpl[i].track.album.images == undefined) {
                        console.log("true");
                        rpl[i].track.album.images[0] = { url: ''};
                    } else {
                        rpl[i].track.album.images[0].url = { url: ''};
                    }  
                }
            }
        }

        return (
            <div>
                <div className="playlist-header-background-div-with-save">
                    <div className="playlist-header-div">
                        <h3 className="title-text text-color-teal">Recently Played Tracks</h3>
                        <button className="playlist-button-save button-pink" onClick={() => this.onClick()}>
                        {this.state.buttonText}
                        </button> 
                        {/* <Button className="btn-primary" className="playlist-button-position" className="playlist-button" className={
                            this.state.buttonIsActive ? 'playlist-btn-active' : 'playlist-btn-inactive'} onClick={() => this.onClick()}
                            >
                        {this.state.buttonText}
                        </Button>   */}
                    </div>
                    
                </div>
                <div className="playlist-items-background-div">
                    <div className="playlist-list-container-div">
                        {rpl.map((result, index) => {
                            return (
                                <a 
                                    key={result.id} 
                                    href={null} //later this href can add artist also can later fill in the alt under image source as a common image or something
                                    className="playlist-individual-items"
                                    // onClick={this.artistSelected.bind(this,result)}
                                >
                                    <h6 className="playlist-item-number">{index+1}</h6>
                                    {/* </a><div className="image-wrapper"> */}
                                    <img className="playlist-item-image" src={result.track.album.images[0].url} alt={result.track.album.name}/> 
                                    {/* </div>  */}
                                    <div className="playlist-item-text">
                                        <div className="playlist-item-text-one">{result.track.name}</div>
                                        <div className="playlist-item-text-two">{result.track.artists[0].name}</div>
                                    </div>
                                    
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        )
    }
}
