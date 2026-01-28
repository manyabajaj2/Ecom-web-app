import './Loading.css'

const Loading = ({ message = 'Loading...' }) => {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            {message && <p className="loading-message">{message}</p>}
        </div>
    )
}

export default Loading

