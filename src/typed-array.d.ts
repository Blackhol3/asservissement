declare global {
	interface Uint8Array {
		setFromBase64(string: string, options?: { alphabet?: 'base64' | 'base64url', lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial' }): { read: number, written: number };
		setFromHex(string: string): { read: number, written: number };
		toBase64(options?: { alphabet?: 'base64' | 'base64url', omitPadding?: boolean }): string;
		toHex(): string;
	}

	interface Uint8ArrayConstructor {
		fromBase64(string: string, options?: { alphabet?: 'base64' | 'base64url', lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial' }): Uint8Array;
		fromHex(string: string): Uint8Array;
	}
}

export {};
