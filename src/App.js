import './App.css';
import { useEffect, useState } from 'react';



const SignUpForm = ({ onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <label>
        Username
        <input type="text" name="username"/>
      </label>
      <label>
        Password
        <input type="password" name="password"/>
      </label>
      <input type="submit" value="Sign Up"/>
    </form>
  );
};

const SignInForm = ({ onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <label>
        Username
        <input type="text" name="username"/>
      </label>
      <label>
        Password
        <input type="password" name="password"/>
      </label>
      <input type="submit" value="Sign In"/>
    </form>
  );
};

const withFormValues = fn => evt => {
  evt.preventDefault();
  const values = {
    username: document.querySelector('[name="username"]').value,
    password: document.querySelector('[name="password"]').value,
  };
  return fn(values);
};

const API_ENDPOINT = `https://chiefsmurph.com/post-api`;

const AuthToken = () => <b>auth token</b>;

const UrlSubmit = ({ authToken, onSubmit, onError }) => {
  console.log({authToken});
  const [loading, setLoading] = useState(false);
  const localOnSubmit = evt => {
    evt.preventDefault();
    const url = document.querySelector('[name="url"]').value;
    const urlRegex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
    if (!urlRegex.test(url)) {
      alert(`sorry this is not a valid url\n${url}`);
      document.querySelector('[name="url"]').value = '';
      document.querySelector('[name="url"]').focus();
      return;
    }
    console.log({ url });
    console.log({authToken});
    setLoading(true);
    fetch(`${API_ENDPOINT}/api/post/screenshot?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    }).then(response => response.json())
    .then(response => onSubmit({
      url,
      screenshot: response.filename
    }))
    .catch(e => {
      alert('ERROR WITH THIS URL');
      onError();
    });
  };
  if (loading) {
    return <div><form><h2>loading...</h2></form></div>
  }
  return (
    <div>
      <form onSubmit={localOnSubmit}>
        <h2>type a url to post</h2>
        <input type="text" name="url" placeholder="type a url here" autoFocus />
        <input type="submit" value="Submit" />
      </form>
    </div>
  )
};

const MessageSubmit = ({ authToken, url, screenshot, onSubmit }) => {
  const localSubmit = evt => {
    evt.preventDefault();
    const message =  document.querySelector('[name="message"]').value;
    console.log({ message });
    fetch(`${API_ENDPOINT}/api/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        url,
        screenshot,
        message
      })
    }).then(response => response.json())
    .then(response => {
      console.log({ response });
      onSubmit(response);
    });
  };
  return (
    <div className="message-submit">
      <form onSubmit={localSubmit}>
        <h2>type a message to go along with your post</h2>
        <h1>{url}</h1>
        {/* <div className="side-by-side"> */}
          <img src={`${API_ENDPOINT}/screenshots/${screenshot}`} />
          <textarea name="message" autoFocus placeholder="message goes here" />
        {/* </div> */}
        <input type="submit" value="Submit" />
      </form>
    </div>
  )
};

const PostCreator = ({ authToken, onSubmit }) => {
  const [post, setPost] = useState({});
  if (!post.url) {
    return <UrlSubmit authToken={authToken} onSubmit={setPost} onError={onSubmit} />
  } else {
    return (
      <MessageSubmit 
        authToken={authToken} 
        {...post} 
        onSubmit={onSubmit}
      />
    );
  }
};

const SemiTransBg = ({ onClick }) => <div className="semi-trans-bg" onClick={onClick} />

const Home = ({ authToken }) => {
  const [posts, setPosts] = useState([]);
  const [loggedInAs, setLoggedInAs] = useState(undefined);
  const refreshPosts = () => {
    console.log('refreshing posts')
    fetch(`${API_ENDPOINT}/api/post`, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      // mode: 'cors', // no-cors, *cors, same-origin
      // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      // redirect: 'follow', // manual, *follow, error
      // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      // body: JSON.stringify(values) // body data type must match "Content-Type" header
    })
    .then(response => response.json())
    .then(({ data }) => {setPosts(data); console.log(data)});
  };
  useEffect(() => {
    refreshPosts();
    fetch(`${API_ENDPOINT}/api/user`, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      // mode: 'cors', // no-cors, *cors, same-origin
      // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      // redirect: 'follow', // manual, *follow, error
      // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      // body: JSON.stringify(values) // body data type must match "Content-Type" header
    })
    .then(response => response.json())
    .then(({ data }) => setLoggedInAs(data.username));
  }, []);
  const deletePost = id => {
    fetch(`${API_ENDPOINT}/api/post/${id}`, {
      method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
      // mode: 'cors', // no-cors, *cors, same-origin
      // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      // redirect: 'follow', // manual, *follow, error
      // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      // body: JSON.stringify(values) // body data type must match "Content-Type" header
    })
    .then(response => response.json())
    .then(() => refreshPosts());
  };
  const [creatingPost, setCreatingPost] = useState(false);
  return (
    <div className="home">
      <h1>posts</h1>
      <i>you are logged in as {loggedInAs}</i><br/>
      <button onClick={() => setCreatingPost(true)}>click here to create a new post</button>
      <hr/>
      {
        posts.map(({ url, message, createdBy: { username }, createdAt, screenshot, _id }) => (
          <div className="post">
            {/* <div className="side-by-side"> */}
            {screenshot && <img src={`${API_ENDPOINT}/screenshots/${screenshot}`} className="screenshot"/>}
            <a href={url} target="_blank">{url}</a><br/>
            <pre>{message}</pre>
            <i>posted on {(new Date(createdAt)).toLocaleString()}</i><br/>
            <i>posted by {username}</i><br/>
            {/* </div> */}
            {
              username === loggedInAs && <button onClick={() => deletePost(_id)}>click here to delete this post</button>
            }
          </div>
        ))
      }
      { creatingPost && [
        <SemiTransBg onClick={() => setCreatingPost(false)}/>,
        <PostCreator authToken={authToken} onSubmit={() => { setCreatingPost(false); refreshPosts(); }}/>,
      ]}
    </div>
  )
};




function App() {
  const [authToken, setAuthToken] = useState(window.localStorage.getItem('postToken'));
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const signUpSuccess = token => {
    window.localStorage.setItem('postToken', token);
    setAuthToken(token);
    setIsLoggedIn(true);
  };
  const signUp = withFormValues(values => {
    if (Object.values(values).some(val => !val)) {
      return alert('all fields are mandatory')
    }
    fetch(`${API_ENDPOINT}/signup`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      // mode: 'cors', // no-cors, *cors, same-origin
      // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      // redirect: 'follow', // manual, *follow, error
      // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(values) // body data type must match "Content-Type" header
    })
    .then(response => response.json())
    .then(({ token }) => signUpSuccess(token))
    .catch(e => {
      alert('error creating account');
    });
  });
  
  const signIn = withFormValues(values => {
    console.log({ values })
  });
  useEffect(() => {
    if (authToken) {
      // try to login
      console.log('found a token', authToken)
    }
  }, []);
  if (authToken && isLoggedIn) {
    return <Home authToken={authToken} />;
  } else if (!authToken && !isLoggedIn) {
    return <SignUpForm onSubmit={signUp}/>
  } else if (authToken && !isLoggedIn) {
    return <AuthToken/>;
  } else {
    return <SignUpForm onSubmit={signUp}/>;
  }
  
}

export default App;
