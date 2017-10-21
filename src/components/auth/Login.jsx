import React from 'react';
import * as firebase from 'firebase';
import { Link } from 'react-router';
import { connect } from 'react-redux';


class Login extends React.Component {
	state = {
		email: '',
		password: '',
		error: null
	};

	handleSubmit(event) {
		event.preventDefault();
		firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
			.catch((error) => {
				this.setState({ error: error });
			});
	}

	onInputChange(name, event) {
		var change = {};
		change[name] = event.target.value;
		this.setState(change);
	}

	loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
	     const token = result.credential.accessToken;
	     const user = result.user;
	     console.log("google login success. token=", token, ",user=", JSON.stringify(user));
     }).catch((error) => {
	     this.setState({ error: error});
     });
	}

	render() {
		// var errors = this.state.error ? <p> {this.state.error} </p> : '';
		return (
			<div className="container" style={{minHeight: 'calc(100vh - 72px)'}}>
				<div className="row pb-5">
					<div className="col-md-6 p-5 d-flex justify-content-center">
						<form onSubmit={this.handleSubmit.bind(this)} className="auth-form pt-5">
							<p className="text-center form-title">Welcome back!</p>
							<div className="form-group mb-4">
								<input type="email" className="form-control login-control" placeholder="Enter Email" value={this.state.email} onChange={this.onInputChange.bind(this, 'email')} required />
							</div>
							<div className="form-group mb-5">
								<input type="password" className="form-control login-control" placeholder="Enter Password" value={this.state.password} onChange={this.onInputChange.bind(this, 'password')} required />
							</div>
							<div className="d-flex justify-content-between align-items-center">
								<button type="submit" className="btn btn-login">Login</button>
								<Link to="/forgot" className="link-forgot">UGH..Forgot my password</Link>
							</div>
							<a className="btn btn-signin-google mt-5 white-text" onClick={this.loginWithGoogle.bind(this)}><i className="fa fa-google"></i>Sign In with Google</a>
						</form>
					</div>
					<div className="col-separator"></div>
					<div className="col-md-6 p-5">
						<div className="p-5"></div>
						<img src={process.env.PUBLIC_URL + '/assets/img/resume-unique.png'} alt="resume unique" />
					</div>
				</div>
			</div>
		);
	}
}

export default connect()(Login);