import { Await, useLoaderData, useParams } from "@remix-run/react";
import type { SeoHandleFunction } from "@shopify/hydrogen";
import {
  defer,
  type LoaderArgs,
  type SerializeFrom,
} from "@shopify/remix-oxygen";
import clsx from "clsx";
import { SanityPreview } from "hydrogen-sanity";
import { Suspense } from "react";
import invariant from "tiny-invariant";

import PageHero from "~/components/heroes/Page";
import PortableText from "~/components/portableText/PortableText";
import type { SanityPage } from "~/lib/sanity";
import { ColorTheme } from "~/lib/theme";
import { fetchGids, notFound, validateLocale } from "~/lib/utils";
import { GUIDE_QUERY } from "~/queries/sanity/guide";

const seo: SeoHandleFunction<typeof loader> = ({ data }) => ({
  title: data?.page?.seo?.title,
  description: data?.page?.seo?.description,
  media: data?.page?.seo?.image,
});

export const handle = {
  seo,
};

export async function loader({ params, context }: LoaderArgs) {
  validateLocale({ context, params });

  const { handle } = params;
  invariant(handle, "Missing page handle");

  const cache = context.storefront.CacheCustom({
    mode: "public",
    maxAge: 60,
    staleWhileRevalidate: 60,
  });

  const page = await context.sanity.query<SanityPage>({
    query: GUIDE_QUERY,
    params: {
      slug: handle,
    },
    cache,
  });

  if (!page) {
    throw notFound();
  }

  // Resolve any references to products on the Storefront API
  const gids = fetchGids({ page, context });

  return defer({ page, gids });
}

export default function Page() {
  const { page, gids } = useLoaderData<SerializeFrom<typeof loader>>();
  const { handle } = useParams();

  return (
    <SanityPreview data={page} query={GUIDE_QUERY} params={{ slug: handle }}>
      {(page) => (
        <ColorTheme value={page?.colorTheme}>
          <Suspense>
            <Await resolve={gids}>
              {/* Page hero */}
              <PageHero fallbackTitle={page?.title || ""} hero={page?.hero} />
              {/* Body */}
              {page?.body && (
                <PortableText
                  blocks={page.body}
                  centered
                  className={clsx(
                    "mx-auto max-w-[660px] px-4 pb-24 pt-8", //
                    "md:px-8"
                  )}
                />
              )}
            </Await>
          </Suspense>
        </ColorTheme>
      )}
    </SanityPreview>
  );
}
