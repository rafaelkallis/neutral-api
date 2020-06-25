function S5_covee=covee3(S)
% Input:
%   Matrix S: x-axis::reviewer, y-axis::author
%
% Case 3A:
% S = [
% 0, 70.0/100, 30.0/100;
% 67.7/100, 0, 32.1/100;
% 50.0/100, 50.0/100, 0;
% ]
%
% Case 3B:
% S = [
% 0, 50.0/100, 50.0/100;
% 50.0/100, 0, 50.0/100;
% 58.7/100, 41.3/100, 0;
% ]
%
% Case 3C:
% S = [
% 0, 12.0/100, 88.0/100;
% 57.3/100, 0, 42.7/100;
% 40.8/100, 59.2/100, 0;
% ]
%
% Case 3D:
% S = [
% 0, 45.2/100, 54.8/100;
% 28.3/100, 0, 71.7/100;
% 78.2/100, 21.8/100, 0;
% ]
%
% More Cases:
% S = [
% 0, 50/100, 50/100;
% 0/100, 0, 100/100;
% 0/100, 100/100, 0;
% ]
%
% S = [
% 0, 50/100, 50/100;
% 20/100, 0, 80/100;
% 0/100, 100/100, 0;
% ]
%
% Example with outcome [0.166666, 0.33333, 0.5]'
% S = [
% 0, 20/50, 30/50;
% 10/40, 0, 30/40;
% 10/30, 20/30, 0;
% ]
% covee3(S)
%
% Barebone implementation without any improvements.

n = size(S,1);

S1 = nan(n,n,n);
for j = 1:n
    for k = 1:n
        for i = 1:n
            % relativeContributionRatio
            S1(j,k,i) = S(i,j) / max(1e-16, S(i,k)); % sloppily prevent div-by-0
        end
    end
end

S2 = nan(n,n);
for j = 1:n
    for k = 1:n
        % averageRelativeContributionRatio
        y = 0;
        for i = 1:n
            if (i ~= j && i ~= k)
                y = y + S1(j,k,i);
            end
        end
        S2(j,k) = 1/(n-2) * y;
    end
end

% for teams of 3 members, function
% averageRelativeContributionRatiosWithoutTheInputOfAgentI(j,k,i)
% does not exist

% compared to teams of 4+ persons,
% only the following two functions are changed

S4 = nan(n,1);
for i = 1:n
    % auxiliaryFunction
    y = 1;
    for k = 1:n
        if (k ~= i)
            y = y + S2(k,i);
        end
    end
    S4(i) = 1/y;
end

S5_covee = nan(n,1);
for i = 1:n
    % relativeContribution
    y = S4(i);
    z = 0;
    for j = 1:n
        z = z + S4(j);
    end
    S5_covee(i) = y/z;
end

S5_dvsn = nan(n,1);
for i = 1:n
    % relativeContribution
    y = 1;
    z = 0;
    for j = 1:n
        if (j ~= i)
            y = y - S4(j);
            z = z + S4(i);
        end
    end
    S5_dvsn(i) = 1/n * (y + z);
end

S, S1, S2, S4, S5_covee, S5_dvsn
assert(not(any(isnan(S5_covee(:)))));
assert(all(abs(sum(S5_covee)-1) < 1e-4));
assert(not(any(isnan(S5_dvsn(:)))));
assert(all(abs(sum(S5_dvsn)-1) < 1e-4));

end
