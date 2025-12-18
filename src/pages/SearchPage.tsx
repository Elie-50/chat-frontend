import { useAuthStore } from "@/store/authStore";
import { useSearchStore } from "@/store/searchStore";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useDebounce } from "use-debounce";
import { Search } from "lucide-react";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import Loading from "@/components/Loading";
import UserSearchCard from "@/components/UserSearchCard";

function SearchPage() {
	const { search, result, error, loading } = useSearchStore();
	const { accessToken, refreshToken } = useAuthStore();

	const [searchParams, setSearchParams] = useSearchParams();

	const queryUsername = searchParams.get('username') || '';
	const page = Number(searchParams.get('page')) || 1;
	const size = Number(searchParams.get('size')) || 10;

	const [username, setUsername] = useState<string>(queryUsername);
	const [debouncedUsername] = useDebounce(username, 1000);

	useEffect(() => {
		if (accessToken) {
			search({ username: debouncedUsername, page, size });
		}
	}, [search, debouncedUsername, page, size, accessToken]);

	useEffect(() => {
		if (!accessToken) {
			refreshToken();
		}
	}, [accessToken, refreshToken]);

	useEffect(() => {
		if (debouncedUsername) {
			setSearchParams({ username: debouncedUsername, page: page.toString(), size: size.toString() });
		}
	}, [debouncedUsername, size, setSearchParams, page]);

	const getPages = (current: number, total: number) => {
    const pages: (number | "...")[] = [];

    if (total <= 7) {
      // If small, show everything
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    pages.push(1); // first page always visible

    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push("...");

    pages.push(total); // last page always visible

    return pages;
  };

	const handlePageChange = (newPage: number) => {
    setSearchParams({ username: debouncedUsername, page: newPage.toString(), size: size.toString() });
  };

	return (
		<div className="flex justify-center items-center w-full">
			<div className="w-full max-w-6xl p-4">
				{/* Search Input */}
				<div className="mb-6">
					<InputGroup>
						<InputGroupInput
							placeholder="Search movies..."
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<InputGroupAddon>
							<Search className="w-4 h-4 text-muted-foreground" />
						</InputGroupAddon>
						{result?.total && (
							<InputGroupAddon align="inline-end">
								{result.total} result
								{result.total > 1 ? "s" : ""}
							</InputGroupAddon>
						)}
					</InputGroup>
				</div>

				{loading && <Loading />}
				{error && <p className="text-destructive">Error: {error}</p>}
				{!loading && !error && result?.data?.length === 0 && <p>No results found.</p>}

				{/* Results Grid */}
				<div className="">
					{result?.data?.map((user) => (
							<UserSearchCard key={user._id} user={user} />
					))}
				</div>

				
				{/* Pagination */}
				{result?.total && result.total > 10 && (() => {
					const totalPages = Math.ceil(result.total / 10);
					const pages = getPages(page, totalPages);

					return (
						<Pagination className="mt-6 justify-center">
							<PaginationContent>
								{/* Prev */}
								<PaginationItem>
									<PaginationPrevious
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (page > 1) handlePageChange(page - 1);
										}}
										className={page === 1 ? "pointer-events-none opacity-50" : ""}
									/>
								</PaginationItem>

								{/* Page links */}
								{pages.map((p, i) => (
									<PaginationItem key={i}>
										{p === "..." ? (
											<span className="px-2">…</span>
										) : (
											<PaginationLink
												href="#"
												isActive={p === page}
												onClick={(e) => {
													e.preventDefault();
													handlePageChange(p as number);
												}}
											>
												{p}
											</PaginationLink>
										)}
									</PaginationItem>
								))}

								{/* Next */}
								<PaginationItem>
									<PaginationNext
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (page < totalPages) handlePageChange(page + 1);
										}}
										className={page === totalPages ? "pointer-events-none opacity-50" : ""}
									/>
								</PaginationItem>

							</PaginationContent>
						</Pagination>
					);
				})()}

			</div>
		</div>
	)
}

export default SearchPage
