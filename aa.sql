CREATE OR REPLACE FUNCTION is_past_days(
    start_date timestamp with time zone,
    days integer,
    end_date timestamptz
)
RETURNS boolean
 AS $$
DECLARE
  startxx timestamp with time zone;
BEGIN
    startxx := start_date;
    RAISE NOTICE 'conveted_qty: %', start_date::timestamp with time zone;
    PERFORM end_date::date > (start_date::date + days);
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;