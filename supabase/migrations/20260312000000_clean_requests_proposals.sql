-- Clean all requests (opportunities) and proposals (candidaturas)
-- This removes test data so the platform starts fresh

DELETE FROM proposals;
DELETE FROM requests;
