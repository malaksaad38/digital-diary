"use client";

import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight, Search} from "lucide-react";
import {UserActions} from "@/components/admin/user-actions";
import {format} from "date-fns";
import {LoadingState} from "@/components/LoadingStates";

export default function UsersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(e.target.value);
            setPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const { data, isLoading } = useQuery({
        queryKey: ["admin-users", page, debouncedSearch],
        queryFn: async () => {
            const res = await axios.get(`/api/admin/users?page=${page}&limit=10&search=${debouncedSearch}`);
            return res.data;
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">Manage your application users.</p>
                </div>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8 border border-border"
                        value={search}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800 overflow-hidden">

                {/* ================= DESKTOP TABLE ================= */}
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Prayers</TableHead>
                                <TableHead>Diaries</TableHead>
                                {/*<TableHead>Joined</TableHead>*/}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : data?.users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.users.map((user: any) => (
                                    <TableRow key={user._id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {user.name?.[0]}
                                                </div>
                                                {user.name}
                                            </div>
                                        </TableCell>

                                        <TableCell className="max-w-[220px] truncate">
                                            {user.email}
                                        </TableCell>

                                        <TableCell>
                    <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                    >
                      {user.role}
                    </span>
                                        </TableCell>

                                        <TableCell className="font-mono">
                                            {user.prayerCount || 0}
                                        </TableCell>

                                        <TableCell className="font-mono">
                                            {user.diaryCount || 0}
                                        </TableCell>

                                        {/*<TableCell>*/}
                                        {/*    {user?.createdAt && !isNaN(Date.parse(user.createdAt))*/}
                                        {/*        ? format(new Date(user.createdAt), "MMM d, yyyy")*/}
                                        {/*        : "Invalid date"}*/}
                                        {/*</TableCell>*/}

                                        <TableCell className="text-right">
                                            <UserActions user={user} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* ================= MOBILE CARDS ================= */}
                <div className="md:hidden space-y-4 p-4">
                    {isLoading ? (
                        <div className="text-center text-sm text-muted-foreground">
                            <LoadingState label={"Loading users..."} />

                        </div>
                    ) : data?.users.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground">
                            No users found.
                        </p>
                    ) : (
                        data?.users.map((user: any) => (
                            <div
                                key={user._id}
                                className="rounded-lg border bg-background p-4 shadow-sm space-y-3"
                            >
                                {/* Header */}
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                        {user.name?.[0]}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>

                                    <UserActions user={user} />
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div className={`${!user.role ? "hidden" : "block"}`}>
                                        <p className="text-xs text-muted-foreground">Role</p>
                                        <span className="font-medium">{user.role}</span>
                                    </div>

                  {/*                  <div>*/}
                  {/*                      <p className="text-xs text-muted-foreground">Joined</p>*/}
                  {/*                      <span className="font-medium">*/}
                  {/*  {user?.createdAt && !isNaN(Date.parse(user.createdAt))*/}
                  {/*      ? format(new Date(user.createdAt), "MMM d, yyyy")*/}
                  {/*      : "Invalid"}*/}
                  {/*</span>*/}
                  {/*                  </div>*/}

                                    <div>
                                        <p className="text-xs text-muted-foreground">Prayers</p>
                                        <span className="font-mono">{user.prayerCount || 0}</span>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">Diaries</p>
                                        <span className="font-mono">{user.diaryCount || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
            {data && (
                <div className="flex items-center md:justify-end justify-between gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Page {page} of {data.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                        disabled={page === data.totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}
