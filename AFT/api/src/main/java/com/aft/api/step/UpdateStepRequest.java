package com.aft.api.step;

import com.aft.common.enums.ActionType;

import java.util.Map;

public record UpdateStepRequest(
        ActionType action,
        Map<String,String> selectors,
        String value
) {}
