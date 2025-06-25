CREATE OR REPLACE FUNCTION is_past_days(
    start_date timestamptz,
    days integer,
    end_date timestamptz
)
RETURNS boolean
 AS $$
BEGIN
    RAISE NOTICE 'start_date: %', start_date::date;
    RAISE NOTICE 'end_date: %', end_date::date;
    RAISE NOTICE 'start_date + days: %', (start_date::date + days);
    RETURN end_date::date > (start_date::date + days) ;
END;
$$ LANGUAGE plpgsql IMMUTABLE;