import { Link } from "react-router-dom"

function NotFound() {
	return (
		<div className="w-full flex justify-center items-center p-10">
			<h1 className="text-center text-2xl">
				<span>Whoopsie! It looks that this page doesn't exist. How about you </span>
				<Link
					to='/'
					className="animated-gradient-link text-center font-semibold hover:underline"
				>
					go to homepage{" "}
				</Link>
				<span>instead?</span>
			</h1>			
		</div>
	)
}

export default NotFound
