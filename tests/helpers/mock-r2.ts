/**
 * R2 モック
 *
 * Vitest で画像アップロード/取得をテストするためのインメモリ R2 モック。
 */

interface R2Object {
  key: string
  body: ReadableStream
  httpMetadata?: { contentType?: string }
}

export class MockR2Bucket {
  private objects: Map<string, { body: ArrayBuffer; contentType: string }> =
    new Map()

  async put(
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<void> {
    let body: ArrayBuffer
    if (value instanceof ReadableStream) {
      const reader = value.getReader()
      const chunks: Uint8Array[] = []
      let done = false
      while (!done) {
        const result = await reader.read()
        done = result.done
        if (result.value) chunks.push(result.value)
      }
      const totalLength = chunks.reduce((sum, c) => sum + c.length, 0)
      body = new ArrayBuffer(totalLength)
      const view = new Uint8Array(body)
      let offset = 0
      for (const chunk of chunks) {
        view.set(chunk, offset)
        offset += chunk.length
      }
    } else if (typeof value === 'string') {
      body = new TextEncoder().encode(value).buffer as ArrayBuffer
    } else {
      body = value
    }

    this.objects.set(key, {
      body,
      contentType: options?.httpMetadata?.contentType || 'application/octet-stream',
    })
  }

  async get(key: string): Promise<R2Object | null> {
    const obj = this.objects.get(key)
    if (!obj) return null

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(obj.body))
        controller.close()
      },
    })

    return {
      key,
      body: stream,
      httpMetadata: { contentType: obj.contentType },
    }
  }

  async delete(key: string): Promise<void> {
    this.objects.delete(key)
  }

  // テスト用ヘルパー
  has(key: string): boolean {
    return this.objects.has(key)
  }

  reset() {
    this.objects.clear()
  }
}
