package com.godtravel.backend.model.entity.view;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VueFideliteClientId implements Serializable {
    private static final long serialVersionUID = 1L;
    private String idClient;
    private String typeBilletCumule;
}
