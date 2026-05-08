-- Allow public to read junction table
CREATE POLICY "public_read_lpp" ON public.landing_page_products FOR
SELECT
  USING (
    EXISTS (
      SELECT
        1
      FROM
        public.landing_pages
      WHERE
        id = landing_page_id
        AND is_published = true
    )
  );

-- Allow public to read active products  
CREATE POLICY "public_read_products" ON public.products FOR
SELECT
  USING (is_active = true);