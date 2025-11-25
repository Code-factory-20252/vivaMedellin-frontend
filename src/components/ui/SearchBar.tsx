'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2, X } from 'lucide-react';
import { debounce, searchUsers } from '@/lib/search-utils';
import { UserSearchResult } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from '@/components/ui/FollowButton';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const performSearch = debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length === 0) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data } = await searchUsers(searchQuery);
      setResults(data);
      setIsLoading(false);
      setShowResults(true);
    }, 300);

    performSearch(query);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar usuarios por nombre o username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          className="pl-10 pr-10  dark:border-slate-600"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && query && (
        <Card className="absolute z-50 mt-2 w-full max-h-96 overflow-y-auto shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No se encontraron resultados</p>
            </div>
          ) : (
            <div className="divide-y">
              {results.map((user) => (
                <Link
                  key={user.id}
                  href={`/users/${user.id}`}
                  className="flex items-center justify-between p-4 hover:bg-accent transition-colors"
                  onClick={() => setShowResults(false)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || ''} alt={user.nombre} />
                      <AvatarFallback>{getInitials(user.nombre || user.username)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.nombre || user.username}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <div onClick={(e) => e.preventDefault()}>
                    <FollowButton
                      userId={user.id}
                      isFollowing={user.is_following || false}
                      size="sm"
                      showText={false}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}

      {showResults && query && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
