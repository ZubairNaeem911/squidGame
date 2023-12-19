import LoaderImg from '../../assets/images/loader.gif'

const Loader = (props) => {

    return (


        <div className="loader-wrapper">
            <div className="image">
                <img src={LoaderImg} alt="Loader" className="img-fluid" />
            </div>
        </div>
    )
}
export default Loader
