import React  from 'react';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import 'firebase/firestore';
import AudioTrackElement from './AudioTrackElement';
import { NotificationManager } from 'react-notifications';
import $ from 'jquery';

// let last_created = null;

class AudioTracks extends React.Component {
	state = {
		// user: {...this.props.user, uid: firebase.auth().currentUser.uid},
		resume: this.props.resume,
		type: this.props.type,
		pageNumber: this.props.pageNumber,
		tracks: [],
		last_created: null,
		thisLayout: null
	};

	componentWillMount() {
		this.listener = firebase.firestore().collection('resumes').doc(this.state.resume.resume_id).collection('tracks').onSnapshot((snapshot) => {
			let tracks = [];
		  snapshot.forEach((childSnapshot) => {
		    const childKey = childSnapshot.id;
		    const childData = childSnapshot.data();
		    if(childData.pageNumber === this.state.pageNumber) {
		    	tracks.push({...childData, track_id: childKey});
		    }
		  });
			this.setState({ loaded: true, tracks });
		});
	}

	componentDidMount() {
		this.setState({ thisLayout: {...$(this.domNode).offset(), width: $(this.domNode).width(), height: $(this.domNode).height()}});
		$(window).on('resize', () => {
			this.setState({ thisLayout: {...$(this.domNode).offset(), width: $(this.domNode).width(), height: $(this.domNode).height()}});
		})
	}

	componentWillUnmount() {
		this.listener && (this.listener)();
	}

	handleAddNewPoint(e) {

		if(this.props.resume && this.props.resume.tracks && Object.keys(this.props.resume.tracks).length >= 10) {
		  	NotificationManager.error('You cannot add another audio. Maximum limit reached.', 'Error');
		  	return false;
		}
		const { resume, pageNumber } = this.state;
		const pos = { x: e.nativeEvent.offsetX/e.currentTarget.clientWidth, y: e.nativeEvent.offsetY/e.currentTarget.clientHeight };

		const newTrackKey = firebase.firestore().collection('resumes').doc(resume.resume_id).collection('tracks').doc().id;

		const trackData = {
			uid: resume.uid,
			resume_id: resume.resume_id,
			pageNumber: pageNumber,
			file: '',
			length: 0,
			pos: pos,
			step: 0,
			created: new Date(),
			updated: new Date()
		};

		let batch = firebase.firestore().batch();
		batch.set(firebase.firestore().doc('/resumes/' + resume.resume_id + '/tracks/' + newTrackKey), trackData, {merge: true});
		batch.set(firebase.firestore().doc('/users/' + resume.uid + '/resumes/' + resume.resume_id + '/tracks/' + newTrackKey), trackData, {merge: true});

	 	this.setState({ last_created: null });

  	NotificationManager.success('New audio track has been added.', 'Resume Updated');

  	batch.commit().then(() => {
 			this.setState({ last_created: newTrackKey });
  	})
	}

	render() {
		const { loaded, tracks, last_created, thisLayout } = this.state;
		return (
			<div className="audio-track-container" ref={(node) => {this.domNode = node; }}>
				<div className="audio-track-overlay" onClick={(e) => {this.handleAddNewPoint(e)}}></div>
				{ loaded && tracks.map((track, idx) => <AudioTrackElement track={track} key={track.track_id} defaultOpen={track.track_id === last_created} {...this.props} parentLayout={thisLayout} />) }
			</div>
		);
	}
}

export default connect(state=>({
	user: state.auth.user
}))(AudioTracks);
