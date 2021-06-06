import React, { useState } from 'react';
import useAgora from '_hooks/agora/useAgora';
import AgoraVideoPlayer from '../components/AgoraVideoPlayer';

function Home() {
  const [channel, setChannel] = useState('Public');
  const [inviteToken, setInviteToken] = useState('');

  const {
    client,
    handlers: {
      localAudioTrack,
      localVideoTrack,
      leave,
      createRoom,
      remoteUsers,
      token,
      error,
      joinRoom,
      publishTracks,
      isMutedAudio,
      isMutedVideo,
      toggleMute,
    },
  } = useAgora();

  return (
    <div className="call">
      <h1>{error?.message}</h1>
      <h1>{localAudioTrack?.getVolumeLevel()}</h1>
      <form className="call-form">
        <label>
          Token(Optional):
          <input type="text" name="token" value={token ?? ''} />
        </label>
        <label>
          Channel:
          <input
            type="text"
            name="channel"
            onChange={(event) => {
              setChannel(event.target.value);
            }}
            value={channel}
          />
        </label>
        <label>
          Invite Token:
          <input
            type="text"
            name="channel"
            onChange={(event) => {
              setInviteToken(event.target.value);
            }}
            value={inviteToken}
          />
        </label>
        <div className="button-group">
          <button
            id="create"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              createRoom({ channelName: channel });
            }}
          >
            Create
          </button>
          <button
            id="join"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              publishTracks('*');
            }}
          >
            Publish
          </button>
          <button
            id="join"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              toggleMute('audio');
            }}
          >
            {isMutedAudio ? 'UnMute audio' : 'Mute audio'}
          </button>

          <button
            id="join"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              toggleMute('video');
            }}
          >
            {isMutedVideo ? 'UnMute video' : 'Mute video'}
          </button>

          <button
            id="join"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              joinRoom({ channelName: channel, token: inviteToken });
            }}
          >
            Join
          </button>
          <button
            id="leave"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              leave();
            }}
          >
            Leave
          </button>
        </div>
      </form>
      <div className="player-container">
        <div className="local-player-wrapper">
          <p className="local-player-text">
            {localVideoTrack && 'localTrack'}
            {localVideoTrack ? `(${client?.uid})` : ''}
          </p>
          <AgoraVideoPlayer
            videoTrack={localVideoTrack}
            audioTrack={localAudioTrack}
          />
        </div>
        {remoteUsers.map((user) => (
          <div className="remote-player-wrapper" key={user.uid}>
            <p className="remote-player-text">{`remoteVideo(${user.uid})`}</p>
            <AgoraVideoPlayer
              videoTrack={user.videoTrack}
              audioTrack={user.audioTrack}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
